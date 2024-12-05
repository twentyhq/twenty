import { useRecoilValue } from 'recoil';

import { useSignInUp } from '@/auth/sign-in-up/hooks/useSignInUp';
import { useSignInUpForm } from '@/auth/sign-in-up/hooks/useSignInUpForm';
import { SignInUpStep } from '@/auth/states/signInUpStepState';
import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';

import { SignInUpGlobalScopeForm } from '@/auth/sign-in-up/components/SignInUpGlobalScopeForm';
import { FooterNote } from '@/auth/sign-in-up/components/FooterNote';
import { AnimatedEaseIn } from 'twenty-ui';
import { Logo } from '@/auth/components/Logo';
import { Title } from '@/auth/components/Title';
import { SignInUpWorkspaceScopeForm } from '@/auth/sign-in-up/components/SignInUpWorkspaceScopeForm';
import { DEFAULT_WORKSPACE_NAME } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceName';
import { SignInUpSSOIdentityProviderSelection } from '@/auth/sign-in-up/components/SignInUpSSOIdentityProviderSelection';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useUrlManager } from '@/url-manager/hooks/useUrlManager';
import { useMemo } from 'react';
import { isDefined } from '~/utils/isDefined';
import { SignInUpWorkspaceScopeFormEffect } from '@/auth/sign-in-up/components/SignInUpWorkspaceScopeFormEffect';

export const SignInUp = () => {
  const { form } = useSignInUpForm();
  const { signInUpStep } = useSignInUp(form);
  const { isTwentyHomePage, isTwentyWorkspaceSubdomain } = useUrlManager();

  const workspacePublicData = useRecoilValue(workspacePublicDataState);
  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);

  const signInUpForm = useMemo(() => {
    if (isTwentyHomePage && isMultiWorkspaceEnabled) {
      return <SignInUpGlobalScopeForm />;
    }

    if (
      (!isMultiWorkspaceEnabled ||
        (isMultiWorkspaceEnabled && isTwentyWorkspaceSubdomain)) &&
      signInUpStep === SignInUpStep.SSOIdentityProviderSelection
    ) {
      return <SignInUpSSOIdentityProviderSelection />;
    }

    if (
      isDefined(workspacePublicData) &&
      (!isMultiWorkspaceEnabled || isTwentyWorkspaceSubdomain)
    ) {
      return (
        <>
          <SignInUpWorkspaceScopeFormEffect />
          <SignInUpWorkspaceScopeForm />
        </>
      );
    }

    return <SignInUpGlobalScopeForm />;
  }, [
    isTwentyHomePage,
    isMultiWorkspaceEnabled,
    isTwentyWorkspaceSubdomain,
    signInUpStep,
    workspacePublicData,
  ]);

  return (
    <>
      <AnimatedEaseIn>
        <Logo secondaryLogo={workspacePublicData?.logo} />
      </AnimatedEaseIn>
      <Title animate>
        {`Welcome to ${workspacePublicData?.displayName ?? DEFAULT_WORKSPACE_NAME}`}
      </Title>
      {signInUpForm}
      {signInUpStep !== SignInUpStep.Password && <FooterNote />}
    </>
  );
};
