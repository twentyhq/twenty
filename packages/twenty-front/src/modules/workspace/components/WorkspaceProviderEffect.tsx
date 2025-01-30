import { useRecoilValue } from 'recoil';

import { useEffect } from 'react';
import { isDefined } from '~/utils/isDefined';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { lastAuthenticatedWorkspaceDomainState } from '@/domain-manager/states/lastAuthenticatedWorkspaceDomainState';
import { useReadWorkspaceUrlFromCurrentLocation } from '@/domain-manager/hooks/useReadWorkspaceUrlFromCurrentLocation';

import { useIsCurrentLocationOnDefaultDomain } from '@/domain-manager/hooks/useIsCurrentLocationOnDefaultDomain';
import { useGetPublicWorkspaceDataByDomain } from '@/domain-manager/hooks/useGetPublicWorkspaceDataByDomain';
import { useGetWorkspaceUrlFromWorkspaceUrls } from '@/domain-manager/hooks/useGetWorkspaceUrlFromWorkspaceUrls';
export const WorkspaceProviderEffect = () => {
  const { data: getPublicWorkspaceData } = useGetPublicWorkspaceDataByDomain();

  const lastAuthenticatedWorkspaceDomain = useRecoilValue(
    lastAuthenticatedWorkspaceDomainState,
  );

  const { getWorkspaceUrl } = useGetWorkspaceUrlFromWorkspaceUrls();

  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();
  const { isDefaultDomain } = useIsCurrentLocationOnDefaultDomain();

  const { currentLocationHostname } = useReadWorkspaceUrlFromCurrentLocation();

  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);

  useEffect(() => {
    const customUrlHostname = getPublicWorkspaceData?.workspaceUrls.customUrl
      ? new URL(getPublicWorkspaceData?.workspaceUrls.customUrl).hostname
      : undefined;
    const subdomainUrlHostname = getPublicWorkspaceData?.workspaceUrls
      .subdomainUrl
      ? new URL(getPublicWorkspaceData?.workspaceUrls.subdomainUrl).hostname
      : undefined;
    if (
      isMultiWorkspaceEnabled &&
      isDefined(getPublicWorkspaceData) &&
      currentLocationHostname !== customUrlHostname &&
      currentLocationHostname !== subdomainUrlHostname
    ) {
      redirectToWorkspaceDomain(
        getWorkspaceUrl(getPublicWorkspaceData.workspaceUrls),
      );
    }
  }, [
    isMultiWorkspaceEnabled,
    redirectToWorkspaceDomain,
    getPublicWorkspaceData,
    currentLocationHostname,
    getWorkspaceUrl,
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
