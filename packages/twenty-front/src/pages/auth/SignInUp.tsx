import { useSignInUp } from '@/auth/sign-in-up/hooks/useSignInUp';
import { useSignInUpForm } from '@/auth/sign-in-up/hooks/useSignInUpForm';
import { SignInUpStep } from '@/auth/states/signInUpStepState';
import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import { useRecoilValue } from 'recoil';

import { Logo } from '@/auth/components/Logo';
import { Title } from '@/auth/components/Title';
import { EmailVerificationSent } from '@/auth/sign-in-up/components/EmailVerificationSent';
import { FooterNote } from '@/auth/sign-in-up/components/FooterNote';
import { SignInUpGlobalScopeForm } from '@/auth/sign-in-up/components/SignInUpGlobalScopeForm';
import { SignInUpSSOIdentityProviderSelection } from '@/auth/sign-in-up/components/SignInUpSSOIdentityProviderSelection';
import { SignInUpWorkspaceScopeForm } from '@/auth/sign-in-up/components/SignInUpWorkspaceScopeForm';
import { SignInUpWorkspaceScopeFormEffect } from '@/auth/sign-in-up/components/SignInUpWorkspaceScopeFormEffect';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useGetPublicWorkspaceDataBySubdomain } from '@/domain-manager/hooks/useGetPublicWorkspaceDataBySubdomain';
import { useIsCurrentLocationOnAWorkspaceSubdomain } from '@/domain-manager/hooks/useIsCurrentLocationOnAWorkspaceSubdomain';
import { useIsCurrentLocationOnDefaultDomain } from '@/domain-manager/hooks/useIsCurrentLocationOnDefaultDomain';
import { DEFAULT_WORKSPACE_NAME } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceName';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared';
import { AnimatedEaseIn } from 'twenty-ui';

import { useWorkspaceFromInviteHash } from '@/auth/sign-in-up/hooks/useWorkspaceFromInviteHash';
import { useLingui } from '@lingui/react/macro';
import { useSearchParams } from 'react-router-dom';
import { PublicWorkspaceDataOutput } from '~/generated-metadata/graphql';

const StandardContent = ({
  workspacePublicData,
  signInUpForm,
  signInUpStep,
  title,
}: {
  workspacePublicData: PublicWorkspaceDataOutput | null;
  signInUpForm: JSX.Element | null;
  signInUpStep: SignInUpStep;
  title: string;
}) => {
  return (
    <>
      <AnimatedEaseIn>
        <Logo secondaryLogo={workspacePublicData?.logo} />
      </AnimatedEaseIn>
      <Title animate>{title}</Title>
      {signInUpForm}
      {signInUpStep !== SignInUpStep.Password && <FooterNote />}
    </>
  );
};

export const SignInUp = () => {
  const { t } = useLingui();

  const { form } = useSignInUpForm();
  const { signInUpStep } = useSignInUp(form);
  const { isDefaultDomain } = useIsCurrentLocationOnDefaultDomain();
  const { isOnAWorkspaceSubdomain } =
    useIsCurrentLocationOnAWorkspaceSubdomain();
  const workspacePublicData = useRecoilValue(workspacePublicDataState);
  const { loading } = useGetPublicWorkspaceDataBySubdomain();
  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);
  const { workspaceInviteHash, workspace: workspaceFromInviteHash } =
    useWorkspaceFromInviteHash();

  const [searchParams] = useSearchParams();
  const title = useMemo(() => {
    if (isDefined(workspaceInviteHash)) {
      return `Join ${workspaceFromInviteHash?.displayName ?? ''} team`;
    }
    const workspaceName = !isDefined(workspacePublicData?.displayName)
      ? DEFAULT_WORKSPACE_NAME
      : workspacePublicData?.displayName === ''
        ? t`Your Workspace`
        : workspacePublicData?.displayName;

    return t`Welcome to ${workspaceName}`;
  }, [
    workspaceFromInviteHash?.displayName,
    workspaceInviteHash,
    workspacePublicData?.displayName,
    t,
  ]);

  const signInUpForm = useMemo(() => {
    if (loading) return null;

    if (isDefaultDomain && isMultiWorkspaceEnabled) {
      return <SignInUpGlobalScopeForm />;
    }

    if (
      (!isMultiWorkspaceEnabled ||
        (isMultiWorkspaceEnabled && isOnAWorkspaceSubdomain)) &&
      signInUpStep === SignInUpStep.SSOIdentityProviderSelection
    ) {
      return <SignInUpSSOIdentityProviderSelection />;
    }

    if (
      isDefined(workspacePublicData) &&
      (!isMultiWorkspaceEnabled || isOnAWorkspaceSubdomain)
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
    isDefaultDomain,
    isMultiWorkspaceEnabled,
    isOnAWorkspaceSubdomain,
    loading,
    signInUpStep,
    workspacePublicData,
  ]);

  if (signInUpStep === SignInUpStep.EmailVerification) {
    return <EmailVerificationSent email={searchParams.get('email')} />;
  }

  return (
    <StandardContent
      workspacePublicData={workspacePublicData}
      signInUpForm={signInUpForm}
      signInUpStep={signInUpStep}
      title={title}
    />
  );
};
