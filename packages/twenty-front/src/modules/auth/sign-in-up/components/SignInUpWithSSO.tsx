import { useSSO } from '@/auth/sign-in-up/hooks/useSSO';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { workspaceAuthProvidersState } from '@/workspace/states/workspaceAuthProvidersState';
import { useTheme } from '@emotion/react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { HorizontalSeparator, IconLock, MainButton } from 'twenty-ui';

export const SignInUpWithSSO = () => {
  const theme = useTheme();
  const setSignInUpStep = useSetRecoilState(signInUpStepState);
  const workspaceAuthProviders = useRecoilValue(workspaceAuthProvidersState);

  const signInUpStep = useRecoilValue(signInUpStepState);

  const { redirectToSSOLoginPage } = useSSO();

  const signInWithSSO = () => {
    if (workspaceAuthProviders.sso.length === 1) {
      return redirectToSSOLoginPage(workspaceAuthProviders.sso[0].id);
    }

    setSignInUpStep(SignInUpStep.SSOIdentityProviderSelection);
  };

  return (
    <>
      <MainButton
        Icon={() => <IconLock size={theme.icon.size.md} />}
        title="Single sign-on (SSO)"
        onClick={signInWithSSO}
        variant={signInUpStep === SignInUpStep.Init ? undefined : 'secondary'}
        fullWidth
      />
      <HorizontalSeparator visible={false} />
    </>
  );
};
