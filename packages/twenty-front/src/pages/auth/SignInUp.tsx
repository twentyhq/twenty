import { useSignInUp } from '@/auth/sign-in-up/hooks/useSignInUp';
import { useSignInUpForm } from '@/auth/sign-in-up/hooks/useSignInUpForm';
import { SignInUpStep } from '@/auth/states/signInUpStepState';
import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import { Trans } from '@lingui/react/macro';
import { useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
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
import { AnimatedEaseIn } from 'twenty-ui';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';
import { isDefined } from '~/utils/isDefined';

import { PublicWorkspaceDataOutput } from '~/generated-metadata/graphql';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

const StandardContent = ({
  workspacePublicData,
  signInUpForm,
  signInUpStep,
}: {
  workspacePublicData: PublicWorkspaceDataOutput | null;
  signInUpForm: JSX.Element | null;
  signInUpStep: SignInUpStep;
}) => {
  return (
    <>
      <AnimatedEaseIn>
        <Logo secondaryLogo={workspacePublicData?.logo} />
      </AnimatedEaseIn>
      <Title animate>
        <Trans>Welcome to</Trans>{' '}
        {!isDefined(workspacePublicData?.displayName) ? (
          DEFAULT_WORKSPACE_NAME
        ) : workspacePublicData?.displayName === '' ? (
          <Trans>Your Workspace</Trans>
        ) : (
          workspacePublicData?.displayName
        )}
      </Title>
      {signInUpForm}
      {signInUpStep !== SignInUpStep.Password && <FooterNote />}
    </>
  );
};

export const SignInUp = () => {
  const { form } = useSignInUpForm();
  const { signInUpStep } = useSignInUp(form);
  const { isDefaultDomain } = useIsCurrentLocationOnDefaultDomain();
  const { isOnAWorkspaceSubdomain } =
    useIsCurrentLocationOnAWorkspaceSubdomain();
  const workspacePublicData = useRecoilValue(workspacePublicDataState);
  const { loading } = useGetPublicWorkspaceDataBySubdomain();
  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);
  const { locale } = useParams();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!isUndefinedOrNull(locale)) {
      dynamicActivate(locale);
    }
  }, [locale]);

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
    />
  );
};
