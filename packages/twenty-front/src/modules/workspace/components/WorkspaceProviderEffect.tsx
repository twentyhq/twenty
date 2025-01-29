import { useRecoilValue, useSetRecoilState } from 'recoil';

import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useReadWorkspaceSubdomainFromCurrentLocation } from '@/domain-manager/hooks/useReadWorkspaceSubdomainFromCurrentLocation';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { lastAuthenticatedWorkspaceDomainState } from '@/domain-manager/states/lastAuthenticatedWorkspaceDomainState';
import { useEffect } from 'react';
import { isDefined } from '~/utils/isDefined';

import { useSSO } from '@/auth/sign-in-up/hooks/useSSO';
import { signInUpStepState } from '@/auth/states/signInUpStepState';
import { useGetPublicWorkspaceDataBySubdomain } from '@/domain-manager/hooks/useGetPublicWorkspaceDataBySubdomain';
import { useIsCurrentLocationOnDefaultDomain } from '@/domain-manager/hooks/useIsCurrentLocationOnDefaultDomain';
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
