import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { Logo } from '@/auth/components/Logo';
import { Title } from '@/auth/components/Title';
import { SignInUpForm } from '@/auth/sign-in-up/components/SignInUpForm';
import { SignInUpMode, useSignInUp } from '@/auth/sign-in-up/hooks/useSignInUp';
import { useSignInUpForm } from '@/auth/sign-in-up/hooks/useSignInUpForm';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { AnimatedEaseIn } from '@/ui/utilities/animation/components/AnimatedEaseIn';
import { isDefined } from '~/utils/isDefined';
import { SignInUpStep } from '@/auth/states/signInUpStepState';
import { IconLockCustom } from '@ui/display/icon/components/IconLock';
import { SSOWorkspaceSelection } from './SSOWorkspaceSelection';

export const SignInUp = () => {
  const { form } = useSignInUpForm();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const { signInUpStep, signInUpMode } = useSignInUp(form);

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
      <Title animate>{title}</Title>
      {signInUpStep === SignInUpStep.SSOWorkspaceSelection ? (
        <SSOWorkspaceSelection />
      ) : (
        <SignInUpForm />
      )}
    </>
  );
};
