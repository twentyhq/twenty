import { useRecoilValue, useSetRecoilState } from 'recoil';

import { useEffect } from 'react';
import { isDefined } from '~/utils/isDefined';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { lastAuthenticatedWorkspaceDomainState } from '@/domain-manager/states/lastAuthenticatedWorkspaceDomainState';
import { useReadWorkspaceSubdomainFromCurrentLocation } from '@/domain-manager/hooks/useReadWorkspaceSubdomainFromCurrentLocation';

import { useIsCurrentLocationOnDefaultDomain } from '@/domain-manager/hooks/useIsCurrentLocationOnDefaultDomain';
import { useGetPublicWorkspaceDataBySubdomain } from '@/domain-manager/hooks/useGetPublicWorkspaceDataBySubdomain';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { useSSO } from '@/auth/sign-in-up/hooks/useSSO';
export const WorkspaceProviderEffect = () => {
  const { data: getPublicWorkspaceData } =
    useGetPublicWorkspaceDataBySubdomain();

  const { redirectToSSOLoginPage } = useSSO();

  const setSignInUpStep = useSetRecoilState(signInUpStepState);

  const lastAuthenticatedWorkspaceDomain = useRecoilValue(
    lastAuthenticatedWorkspaceDomainState,
  );

  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();
  const { isDefaultDomain } = useIsCurrentLocationOnDefaultDomain();

  const { workspaceSubdomain } = useReadWorkspaceSubdomainFromCurrentLocation();

  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);

  useEffect(() => {
    if (isDefaultDomain || !getPublicWorkspaceData) return;

    // checks if any non-SSO providers are enabled
    if (
      Object.values(getPublicWorkspaceData.authProviders).filter(
        (value) => typeof value === 'boolean' && value,
      ).length !== 0
    )
      return;

    if (getPublicWorkspaceData.authProviders.sso.length > 1) {
      return setSignInUpStep(SignInUpStep.SSOIdentityProviderSelection);
    }

    if (getPublicWorkspaceData.authProviders.sso.length === 1) {
      redirectToSSOLoginPage(getPublicWorkspaceData.authProviders.sso[0].id);
    }
  }, [
    redirectToSSOLoginPage,
    setSignInUpStep,
    getPublicWorkspaceData,
    isDefaultDomain,
  ]);

  useEffect(() => {
    if (
      isMultiWorkspaceEnabled &&
      isDefined(getPublicWorkspaceData?.subdomain) &&
      getPublicWorkspaceData.subdomain !== workspaceSubdomain
    ) {
      redirectToWorkspaceDomain(getPublicWorkspaceData.subdomain);
    }
  }, [
    workspaceSubdomain,
    isMultiWorkspaceEnabled,
    redirectToWorkspaceDomain,
    getPublicWorkspaceData,
  ]);

  useEffect(() => {
    if (
      isMultiWorkspaceEnabled &&
      isDefaultDomain &&
      isDefined(lastAuthenticatedWorkspaceDomain) &&
      'subdomain' in lastAuthenticatedWorkspaceDomain &&
      isDefined(lastAuthenticatedWorkspaceDomain?.subdomain)
    ) {
      redirectToWorkspaceDomain(lastAuthenticatedWorkspaceDomain.subdomain);
    }
  }, [
    isMultiWorkspaceEnabled,
    isDefaultDomain,
    lastAuthenticatedWorkspaceDomain,
    redirectToWorkspaceDomain,
  ]);

  return <></>;
};
