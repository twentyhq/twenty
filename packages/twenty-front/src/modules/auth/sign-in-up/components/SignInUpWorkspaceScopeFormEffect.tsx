import { SignInUpStep } from '@/auth/states/signInUpStepState';
import { isDefined } from '~/utils/isDefined';
import { useSignInUp } from '@/auth/sign-in-up/hooks/useSignInUp';
import { authProvidersState } from '@/client-config/states/authProvidersState';
import { useSignInUpForm } from '@/auth/sign-in-up/hooks/useSignInUpForm';
import { useRecoilState } from 'recoil';
import { useCallback, useEffect } from 'react';

export const SignInUpWorkspaceScopeFormEffect = () => {
  const [authProviders] = useRecoilState(authProvidersState);

  const { form } = useSignInUpForm();

  const { signInUpStep, continueWithEmail, continueWithCredentials } =
    useSignInUp(form);

  const searchParams = new URLSearchParams(window.location.search);
  const email = searchParams.get('email');

  const checkAuthProviders = useCallback(() => {
    if (
      signInUpStep === SignInUpStep.Init &&
      !authProviders.google &&
      !authProviders.microsoft &&
      !authProviders.sso
    ) {
      return continueWithEmail();
    }

    if (isDefined(email) && authProviders.password) {
      return continueWithCredentials();
    }
  }, [
    continueWithCredentials,
    authProviders.google,
    authProviders.microsoft,
    authProviders.password,
    authProviders.sso,
    continueWithEmail,
    signInUpStep,
  ]);

  useEffect(() => {
    checkAuthProviders();
  }, [checkAuthProviders]);

  return <></>;
};
