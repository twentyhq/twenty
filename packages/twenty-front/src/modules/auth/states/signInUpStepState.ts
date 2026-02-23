import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
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

export const signInUpStepState = createStateV2<SignInUpStep>({
  key: 'signInUpStepState',
  defaultValue: SignInUpStep.Init,
});
