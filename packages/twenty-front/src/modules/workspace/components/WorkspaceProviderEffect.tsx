import { useRecoilValue } from 'recoil';

import { useEffect } from 'react';
import { isDefined } from '~/utils/isDefined';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { lastAuthenticatedWorkspaceDomainState } from '@/domain-manager/states/lastAuthenticatedWorkspaceDomainState';
import { useReadWorkspaceSubdomainFromCurrentLocation } from '@/domain-manager/hooks/useReadWorkspaceSubdomainFromCurrentLocation';

import { useIsCurrentLocationOnDefaultDomain } from '@/domain-manager/hooks/useIsCurrentLocationOnDefaultDomain';
import { useGetPublicWorkspaceDataBySubdomain } from '@/domain-manager/hooks/useGetPublicWorkspaceDataBySubdomain';
export const WorkspaceProviderEffect = () => {
  const { data: getPublicWorkspaceData } =
    useGetPublicWorkspaceDataBySubdomain();

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
