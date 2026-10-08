import {
  type GetUserApplicationVariablesFunction,
  type UpdateUserApplicationVariableFunction,
} from 'twenty-sdk/front-component';

export type FrontComponentUserApplicationVariableAccess = {
  applicationId: string;
  getUserApplicationVariables: GetUserApplicationVariablesFunction;
  updateUserApplicationVariable: UpdateUserApplicationVariableFunction;
};
