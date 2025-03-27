import { createState } from 'twenty-ui/utilities';
export enum SignInUpStep {
  Init = 'init',
  Email = 'email',
  Password = 'password',
  EmailVerification = 'emailVerification',
  WorkspaceSelection = 'workspaceSelection',
  SSOIdentityProviderSelection = 'SSOIdentityProviderSelection',
}

export const signInUpStepState = createState<SignInUpStep>({
  key: 'signInUpStepState',
  defaultValue: SignInUpStep.Init,
});
