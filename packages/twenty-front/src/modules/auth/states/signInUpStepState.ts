import { createState } from 'twenty-ui';

export enum SignInUpStep {
  Init = 'init',
  Email = 'email',
  Password = 'password',
  SSOEmail = 'SSOEmail',
  WorkspaceSelection = 'WorkspaceSelection',
}

export const signInUpStepState = createState<SignInUpStep>({
  key: 'signInUpStepState',
  defaultValue: SignInUpStep.Init,
});
