import { useRecoilValue } from 'recoil';

import { useEffect } from 'react';
import { isDefined } from '~/utils/isDefined';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { lastAuthenticatedWorkspaceDomainState } from '@/domain-manager/states/lastAuthenticatedWorkspaceDomainState';
import { useReadWorkspaceUrlFromCurrentLocation } from '@/domain-manager/hooks/useReadWorkspaceUrlFromCurrentLocation';

import { useIsCurrentLocationOnDefaultDomain } from '@/domain-manager/hooks/useIsCurrentLocationOnDefaultDomain';
import { useGetPublicWorkspaceDataByDomain } from '@/domain-manager/hooks/useGetPublicWorkspaceDataByDomain';
export const WorkspaceProviderEffect = () => {
  const { data: getPublicWorkspaceData } = useGetPublicWorkspaceDataByDomain();

  const lastAuthenticatedWorkspaceDomain = useRecoilValue(
    lastAuthenticatedWorkspaceDomainState,
  );

  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();
  const { isDefaultDomain } = useIsCurrentLocationOnDefaultDomain();

  const { workspaceUrl } = useReadWorkspaceUrlFromCurrentLocation();

  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);

  useEffect(() => {
    if (
      isMultiWorkspaceEnabled &&
      isDefined(getPublicWorkspaceData?.workspaceUrl) &&
      new URL(getPublicWorkspaceData.workspaceUrl).hostname !== workspaceUrl
    ) {
      redirectToWorkspaceDomain(getPublicWorkspaceData.workspaceUrl);
    }
  }, [
    workspaceUrl,
    isMultiWorkspaceEnabled,
    redirectToWorkspaceDomain,
    getPublicWorkspaceData,
  ]);

  useEffect(() => {
    if (
      isMultiWorkspaceEnabled &&
      isDefaultDomain &&
      isDefined(lastAuthenticatedWorkspaceDomain) &&
      'workspaceUrl' in lastAuthenticatedWorkspaceDomain &&
      isDefined(lastAuthenticatedWorkspaceDomain?.workspaceUrl)
    ) {
      redirectToWorkspaceDomain(lastAuthenticatedWorkspaceDomain.workspaceUrl);
    }
  }, [
    isMultiWorkspaceEnabled,
    isDefaultDomain,
    lastAuthenticatedWorkspaceDomain,
    redirectToWorkspaceDomain,
  ]);

  return <></>;
};
