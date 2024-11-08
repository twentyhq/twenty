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
import { useWorkspacePublicData } from '@/auth/sign-in-up/hooks/useWorkspacePublicData';
import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';

export const SignInUpLegacy = () => {
  const { form } = useSignInUpForm();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const { signInUpStep, signInUpMode } = useSignInUp(form);

  const { loading } = useWorkspacePublicData();

  const workspacePublicData = useRecoilValue(workspacePublicDataState);

  const title = useMemo(() => {
    if (
      signInUpStep === SignInUpStep.Init ||
      signInUpStep === SignInUpStep.Email
    ) {
      return `Welcome to ${workspacePublicData?.displayName ?? 'Twenty'}`;
    }
    if (signInUpStep === SignInUpStep.WorkspaceSelection) {
      return 'Choose a workspace';
    }
    return signInUpMode === SignInUpMode.SignIn
      ? `Sign in to ${workspacePublicData?.displayName ?? 'Twenty'}`
      : `Sign up to ${workspacePublicData?.displayName ?? 'Twenty'}`;
  }, [signInUpMode, signInUpStep, workspacePublicData]);

  if (isDefined(currentWorkspace)) {
    return <></>;
  }

  return (
    <>
      <AnimatedEaseIn>
        {signInUpStep === SignInUpStep.WorkspaceSelection ? (
          <IconLockCustom size={40} />
        ) : (
          <Logo workspaceLogo={workspacePublicData?.logo} />
        )}
      </AnimatedEaseIn>
      {/*{!loading && (*/}
      {/*  <>*/}
      {/*    <Title animate>{title}</Title>*/}
      {/*    {signInUpStep === SignInUpStep.WorkspaceSelection ? (*/}
      {/*      <SignInUpWorkspaceSelection />*/}
      {/*    ) : (*/}
      {/*      <SignInUpForm />*/}
      {/*    )}*/}
      {/*  </>*/}
      {/*)}*/}
    </>
  );
};
