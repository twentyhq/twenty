import { createState } from '@/ui/utilities/state/utils/createState';
export enum SignInUpStep {
  Init = 'init',
  Email = 'email',
  Password = 'password',
  EmailVerification = 'emailVerification',
  WorkspaceSelection = 'workspaceSelection',
  SSOIdentityProviderSelection = 'SSOIdentityProviderSelection',
  TwoFactorAuthenticationVerification = 'TwoFactorAuthenticationVerification',
  TwoFactorAuthenticationProvision = 'TwoFactorAuthenticationProvision',
}

export const signInUpStepState = createState<SignInUpStep>({
  key: 'signInUpStepState',
  defaultValue: SignInUpStep.Init,
});
