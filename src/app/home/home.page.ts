import { Component } from '@angular/core';
import * as AWS from 'aws-sdk';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  UPDATE_FUNC = 'updateMemberPoints';
  GETBYID_FUNC = 'getMemberById';

  title = 'AWS Lambda Function Call';
  newPoints: any;
  member = { id: '', name: '', points: '' };
  lambda: any;
  showLoader: boolean = false;

  ngOnInit(): void {
    AWS.config.update({
      region: 'us-east-2',
      accessKeyId: "access_key_id",
      secretAccessKey: "secret_access_key"
    });
    this.lambda = new AWS.Lambda();
  }

  idEntered() {
    console.log(this.member);
    this.callLambdaFunction(this.GETBYID_FUNC);
  }

  addPoints() {
    if (this.newPoints) {
      let cloneMemObj = JSON.parse(JSON.stringify(this.member));
      cloneMemObj.points = this.newPoints;
      this.callLambdaFunction(this.UPDATE_FUNC, cloneMemObj);
    }
  }

  callLambdaFunction(functionName: string, memberObj = this.member){
    if (this.member.id) {
      this.showLoader = true;
      let params = {
        FunctionName: functionName, /* required */
        Payload: JSON.stringify(memberObj)
      };

      let _self = this;
      console.log('Invoking lambda function : ' + functionName);
      this.lambda.invoke(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
          let user = JSON.parse(data.Payload);
          console.log(user);
          console.log(typeof user);
          if (functionName == _self.GETBYID_FUNC)
            if(user.id!=0){
              _self.member = user;
            }else{
              _self.member.id = '';
              _self.member.name = '';
              _self.member.points = '';
            }
            
          else {
            if(user){
              _self.callLambdaFunction(_self.GETBYID_FUNC);
              _self.newPoints = '';
            }
          }
        }

        _self.showLoader = false;

      });
    }
  }

}
