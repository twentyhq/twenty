import { useSignInUp } from '@/auth/sign-in-up/hooks/useSignInUp';
import { useSignInUpForm } from '@/auth/sign-in-up/hooks/useSignInUpForm';
import { SignInUpStep } from '@/auth/states/signInUpStepState';
import { workspaceAuthProvidersState } from '@/workspace/states/workspaceAuthProvidersState';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from '~/utils/isDefined';
import { isRequestingCaptchaTokenState } from '@/captcha/states/isRequestingCaptchaTokenState';

const searchParams = new URLSearchParams(window.location.search);
const email = searchParams.get('email');

export const SignInUpWorkspaceScopeFormEffect = () => {
  const workspaceAuthProviders = useRecoilValue(workspaceAuthProvidersState);

  const isRequestingCaptchaToken = useRecoilValue(
    isRequestingCaptchaTokenState,
  );

  const [isInitialLoading, setIsInitialLoading] = useState(false);

  const { form } = useSignInUpForm();

  const { signInUpStep, continueWithEmail, continueWithCredentials } =
    useSignInUp(form);

  useEffect(() => {
    if (!isRequestingCaptchaToken) {
      setIsInitialLoading(true);
    }
  }, [isRequestingCaptchaToken]);

  useEffect(() => {
    if (
      signInUpStep === SignInUpStep.Init &&
      !workspaceAuthProviders.google &&
      !workspaceAuthProviders.microsoft &&
      !workspaceAuthProviders.sso
    ) {
      continueWithEmail();
      return;
    }

    if (
      isDefined(email) &&
      workspaceAuthProviders.password &&
      isInitialLoading
    ) {
      continueWithCredentials();
    }
  }, [
    signInUpStep,
    workspaceAuthProviders.google,
    workspaceAuthProviders.microsoft,
    workspaceAuthProviders.sso,
    workspaceAuthProviders.password,
    continueWithEmail,
    continueWithCredentials,
    isInitialLoading,
  ]);

  return <></>;
};
