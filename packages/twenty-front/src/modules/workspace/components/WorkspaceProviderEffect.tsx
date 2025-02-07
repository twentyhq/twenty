import { useRecoilValue } from 'recoil';

import { useEffect } from 'react';
import { isDefined } from 'twenty-shared';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { lastAuthenticatedWorkspaceDomainState } from '@/domain-manager/states/lastAuthenticatedWorkspaceDomainState';
import { useReadWorkspaceUrlFromCurrentLocation } from '@/domain-manager/hooks/useReadWorkspaceUrlFromCurrentLocation';

import { useIsCurrentLocationOnDefaultDomain } from '@/domain-manager/hooks/useIsCurrentLocationOnDefaultDomain';
import { useGetPublicWorkspaceDataByDomain } from '@/domain-manager/hooks/useGetPublicWorkspaceDataByDomain';
import { WorkspaceUrls } from '~/generated/graphql';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';
export const WorkspaceProviderEffect = () => {
  const { data: getPublicWorkspaceData } = useGetPublicWorkspaceDataByDomain();

  const lastAuthenticatedWorkspaceDomain = useRecoilValue(
    lastAuthenticatedWorkspaceDomainState,
  );

  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();
  const { isDefaultDomain } = useIsCurrentLocationOnDefaultDomain();

  const { currentLocationHostname } = useReadWorkspaceUrlFromCurrentLocation();

  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);

  const getHostnamesFromWorkspaceUrls = (workspaceUrls: WorkspaceUrls) => {
    return {
      customUrlHostname: workspaceUrls.customUrl
        ? new URL(workspaceUrls.customUrl).hostname
        : undefined,
      subdomainUrlHostname: new URL(workspaceUrls.subdomainUrl).hostname,
    };
  };

  useEffect(() => {
    const hostnames = getPublicWorkspaceData
      ? getHostnamesFromWorkspaceUrls(getPublicWorkspaceData?.workspaceUrls)
      : null;
    if (
      isMultiWorkspaceEnabled &&
      isDefined(getPublicWorkspaceData) &&
      currentLocationHostname !== hostnames?.customUrlHostname &&
      currentLocationHostname !== hostnames?.subdomainUrlHostname
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
