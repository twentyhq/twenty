import { createState } from 'twenty-ui';

export enum SignInUpStep {
  Init = 'init',
  Email = 'email',
  Password = 'password',
  SSOEmail = 'SSOEmail',
  SSOWorkspaceSelection = 'SSOWorkspaceSelection',
}

export const signInUpStepState = createState<SignInUpStep>({
  key: 'signInUpStepState',
  defaultValue: SignInUpStep.Init,
});
