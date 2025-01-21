import { useSignInUp } from '@/auth/sign-in-up/hooks/useSignInUp';
import { useSignInUpForm } from '@/auth/sign-in-up/hooks/useSignInUpForm';
import { SignInUpStep } from '@/auth/states/signInUpStepState';
import { workspaceAuthProvidersState } from '@/workspace/states/workspaceAuthProvidersState';
import { useCallback, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from '~/utils/isDefined';
import { isCheckUserExistsQueryReadyState } from '@/auth/states/isCheckUserQueryReadyState';

const searchParams = new URLSearchParams(window.location.search);
const email = searchParams.get('email');

export const SignInUpWorkspaceScopeFormEffect = () => {
  const workspaceAuthProviders = useRecoilValue(workspaceAuthProvidersState);
  const isCheckUserExistsQueryReady = useRecoilValue(
    isCheckUserExistsQueryReadyState,
  );

  const { form } = useSignInUpForm();

  const { signInUpStep, continueWithEmail, continueWithCredentials } =
    useSignInUp(form);

  const checkAuthProviders = useCallback(() => {
    if (
      signInUpStep === SignInUpStep.Init &&
      !workspaceAuthProviders.google &&
      !workspaceAuthProviders.microsoft &&
      !workspaceAuthProviders.sso
    ) {
      return continueWithEmail();
    }

    if (
      isDefined(email) &&
      workspaceAuthProviders.password &&
      isCheckUserExistsQueryReady
    ) {
      return continueWithCredentials();
    }
  }, [
    signInUpStep,
    workspaceAuthProviders.google,
    workspaceAuthProviders.microsoft,
    workspaceAuthProviders.sso,
    workspaceAuthProviders.password,
    continueWithEmail,
    continueWithCredentials,
    isCheckUserExistsQueryReady,
  ]);

  useEffect(() => {
    checkAuthProviders();
  }, [checkAuthProviders]);

  return <></>;
};
