import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { Logo } from '@/auth/components/Logo';
import { Title } from '@/auth/components/Title';
import { SignInUpForm } from '@/auth/sign-in-up/components/SignInUpForm';
import { SignInUpMode, useSignInUp } from '@/auth/sign-in-up/hooks/useSignInUp';
import { useSignInUpForm } from '@/auth/sign-in-up/hooks/useSignInUpForm';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SignInUpStep } from '@/auth/states/signInUpStepState';
import { IconLockCustom } from '@ui/display/icon/components/IconLock';
import { AnimatedEaseIn } from 'twenty-ui';
import { isDefined } from '~/utils/isDefined';
import { SSOWorkspaceSelection } from './SSOWorkspaceSelection';
import { useWorkspaceUnauthenticatedData } from '@/auth/sign-in-up/hooks/useWorkspaceUnauthenticatedData';
import { authProvidersState } from '@/client-config/states/authProvidersState';

export const SignInUp = () => {
  const { form } = useSignInUpForm();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const { signInUpStep, signInUpMode } = useSignInUp(form);

  const { loading } = useWorkspaceUnauthenticatedData();
  const authProviders = useRecoilValue(authProvidersState);

  const title = useMemo(() => {
    if (
      signInUpStep === SignInUpStep.Init ||
      signInUpStep === SignInUpStep.Email
    ) {
      return 'Welcome to Twenty';
    }
    if (signInUpStep === SignInUpStep.SSOWorkspaceSelection) {
      return 'Choose SSO connection';
    }
    return signInUpMode === SignInUpMode.SignIn
      ? 'Sign in to Twenty'
      : 'Sign up to Twenty';
  }, [signInUpMode, signInUpStep]);

  if (isDefined(currentWorkspace)) {
    return <></>;
  }

  return (
    <>
      <AnimatedEaseIn>
        {signInUpStep === SignInUpStep.SSOWorkspaceSelection ? (
          <IconLockCustom size={40} />
        ) : (
          <Logo />
        )}
      </AnimatedEaseIn>
      {!loading && (
        <>
          <Title animate>{title}</Title>
          {signInUpStep === SignInUpStep.SSOWorkspaceSelection ? (
            <SSOWorkspaceSelection />
          ) : (
            <SignInUpForm />
          )}
        </>
      )}
    </>
  );
};
