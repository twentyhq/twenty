import { useSignInUp } from '@/auth/sign-in-up/hooks/useSignInUp';
import { useSignInUpForm } from '@/auth/sign-in-up/hooks/useSignInUpForm';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import styled from '@emotion/styled';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { Logo } from '@/auth/components/Logo';
import { Title } from '@/auth/components/Title';
import { EmailVerificationSent } from '@/auth/sign-in-up/components/EmailVerificationSent';
import { FooterNote } from '@/auth/sign-in-up/components/FooterNote';
import { SignInUpGlobalScopeForm } from '@/auth/sign-in-up/components/SignInUpGlobalScopeForm';
import { SignInUpWorkspaceScopeForm } from '@/auth/sign-in-up/components/SignInUpWorkspaceScopeForm';
import { SignInUpSSOIdentityProviderSelection } from '@/auth/sign-in-up/components/internal/SignInUpSSOIdentityProviderSelection';
import { SignInUpWorkspaceScopeFormEffect } from '@/auth/sign-in-up/components/internal/SignInUpWorkspaceScopeFormEffect';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useGetPublicWorkspaceDataByDomain } from '@/domain-manager/hooks/useGetPublicWorkspaceDataByDomain';
import { useIsCurrentLocationOnAWorkspace } from '@/domain-manager/hooks/useIsCurrentLocationOnAWorkspace';
import { useIsCurrentLocationOnDefaultDomain } from '@/domain-manager/hooks/useIsCurrentLocationOnDefaultDomain';
import { DEFAULT_WORKSPACE_NAME } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceName';
import { useMemo } from 'react';

import { SignInUpGlobalScopeFormEffect } from '@/auth/sign-in-up/components/internal/SignInUpGlobalScopeFormEffect';
import { SignInUpTwoFactorAuthenticationProvision } from '@/auth/sign-in-up/components/internal/SignInUpTwoFactorAuthenticationProvision';
import { SignInUpTOTPVerification } from '@/auth/sign-in-up/components/internal/SignInUpTwoFactorAuthenticationVerification';
import { useWorkspaceFromInviteHash } from '@/auth/sign-in-up/hooks/useWorkspaceFromInviteHash';
import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { useLingui } from '@lingui/react/macro';
import { useSearchParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { Loader } from 'twenty-ui/feedback';
import { AnimatedEaseIn } from 'twenty-ui/utilities';
import { type PublicWorkspaceDataOutput } from '~/generated/graphql';

const StyledLoaderContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing(8)};
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing(8)};
`;

const StandardContent = ({
  workspacePublicData,
  signInUpForm,
  signInUpStep,
  title,
  onClickOnLogo,
}: {
  workspacePublicData: PublicWorkspaceDataOutput | null;
  signInUpForm: JSX.Element | null;
  signInUpStep: SignInUpStep;
  title: string;
  onClickOnLogo: () => void;
}) => {
  return (
    <Modal.Content isVerticalCentered isHorizontalCentered>
      <AnimatedEaseIn>
        <Logo
          secondaryLogo={workspacePublicData?.logo}
          placeholder={workspacePublicData?.displayName}
          onClick={onClickOnLogo}
        />
      </AnimatedEaseIn>
      <Title animate>{title}</Title>
      {signInUpForm}
      {![
        SignInUpStep.Password,
        SignInUpStep.TwoFactorAuthenticationProvision,
        SignInUpStep.TwoFactorAuthenticationVerification,
        SignInUpStep.WorkspaceSelection,
      ].includes(signInUpStep) && <FooterNote />}
    </Modal.Content>
  );
};

export const SignInUp = () => {
  const { t } = useLingui();
  const setSignInUpStep = useSetRecoilState(signInUpStepState);
  const clientConfigApiStatus = useRecoilValue(clientConfigApiStatusState);

  const { form } = useSignInUpForm();
  const { signInUpStep } = useSignInUp(form);
  const { isDefaultDomain } = useIsCurrentLocationOnDefaultDomain();
  const { isOnAWorkspace } = useIsCurrentLocationOnAWorkspace();
  const workspacePublicData = useRecoilValue(workspacePublicDataState);
  const { loading: getPublicWorkspaceDataLoading } =
    useGetPublicWorkspaceDataByDomain();
  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);
  const { workspaceInviteHash, workspace: workspaceFromInviteHash } =
    useWorkspaceFromInviteHash();

  const [searchParams] = useSearchParams();

  const onClickOnLogo = () => {
    setSignInUpStep(SignInUpStep.Init);
  };

  const title = useMemo(() => {
    if (isDefined(workspaceInviteHash)) {
      const workspaceName = workspaceFromInviteHash?.displayName ?? '';
      return t`Join ${workspaceName} team`;
    }

    if (signInUpStep === SignInUpStep.WorkspaceSelection) {
      return t`Choose a Workspace`;
    }

    if (signInUpStep === SignInUpStep.TwoFactorAuthenticationProvision) {
      return t`Setup your 2FA`;
    }

    if (signInUpStep === SignInUpStep.TwoFactorAuthenticationVerification) {
      return t`Verify code from the app`;
    }

    const workspaceName = !isDefined(workspacePublicData?.displayName)
      ? DEFAULT_WORKSPACE_NAME
      : workspacePublicData?.displayName === ''
        ? t`Your Workspace`
        : workspacePublicData?.displayName;

    return t`Welcome to ${workspaceName}`;
  }, [
    workspaceInviteHash,
    signInUpStep,
    workspacePublicData?.displayName,
    t,
    workspaceFromInviteHash?.displayName,
  ]);

  const signInUpForm = useMemo(() => {
    if (getPublicWorkspaceDataLoading || !clientConfigApiStatus.isLoadedOnce) {
      return (
        <StyledLoaderContainer>
          <Loader color="gray" />
        </StyledLoaderContainer>
      );
    }

    if (isDefaultDomain && isMultiWorkspaceEnabled) {
      return (
        <>
          <SignInUpGlobalScopeFormEffect />
          <SignInUpGlobalScopeForm />
        </>
      );
    }

    if (
      isOnAWorkspace &&
      signInUpStep === SignInUpStep.SSOIdentityProviderSelection
    ) {
      return <SignInUpSSOIdentityProviderSelection />;
    }

    if (signInUpStep === SignInUpStep.TwoFactorAuthenticationProvision) {
      return <SignInUpTwoFactorAuthenticationProvision />;
    }

    if (signInUpStep === SignInUpStep.TwoFactorAuthenticationVerification) {
      return <SignInUpTOTPVerification />;
    }

    if (isDefined(workspacePublicData) && isOnAWorkspace) {
      return (
        <>
          <SignInUpWorkspaceScopeFormEffect />
          <SignInUpWorkspaceScopeForm />
        </>
      );
    }

    return (
      <>
        <SignInUpGlobalScopeFormEffect />
        <SignInUpGlobalScopeForm />
      </>
    );
  }, [
    clientConfigApiStatus.isLoadedOnce,
    isDefaultDomain,
    isMultiWorkspaceEnabled,
    isOnAWorkspace,
    getPublicWorkspaceDataLoading,
    signInUpStep,
    workspacePublicData,
  ]);

  if (signInUpStep === SignInUpStep.EmailVerification) {
    return (
      <Modal.Content isVerticalCentered isHorizontalCentered>
        <EmailVerificationSent email={searchParams.get('email')} />
      </Modal.Content>
    );
  }

  return (
    <StandardContent
      workspacePublicData={workspacePublicData}
      signInUpForm={signInUpForm}
      signInUpStep={signInUpStep}
      title={title}
      onClickOnLogo={onClickOnLogo}
    />
  );
};
