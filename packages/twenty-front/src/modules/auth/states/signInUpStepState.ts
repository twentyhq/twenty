import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
export enum SignInUpStep {
  Init = 'init',
  Email = 'email',
  Password = 'password',
  EmailVerification = 'emailVerification',
  WorkspaceSelection = 'workspaceSelection',
  SsoIdentityProviderSelection = 'SsoIdentityProviderSelection',
  TwoFactorAuthenticationVerification = 'TwoFactorAuthenticationVerification',
  TwoFactorAuthenticationProvision = 'TwoFactorAuthenticationProvision',
}

export const signInUpStepState = createAtomState<SignInUpStep>({
  key: 'signInUpStepState',
  defaultValue: SignInUpStep.Init,
});
