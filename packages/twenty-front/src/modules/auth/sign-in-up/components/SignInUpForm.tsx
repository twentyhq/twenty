import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { Title } from '@/auth/components/Title';
import { UnloggedSignInUp } from '@/auth/sign-in-up/components/UnloggedSignInUp';
import { useSignInUpForm } from '@/auth/sign-in-up/hooks/useSignInUpForm';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isDefined } from '~/utils/isDefined';

import { SignInUpMode, SignInUpStep, useSignInUp } from '../hooks/useSignInUp';

export const SignInUpForm = () => {
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
    return signInUpMode === SignInUpMode.SignIn
      ? 'Sign in to Twenty'
      : 'Sign up to Twenty';
  }, [signInUpMode, signInUpStep]);

  if (isDefined(currentWorkspace)) {
    return <></>;
  }

  return (
    <>
      <Title animate>{title}</Title>
      <UnloggedSignInUp />
    </>
  );
};
