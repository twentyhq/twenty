import { useRecoilValue } from 'recoil';

import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useReadWorkspaceUrlFromCurrentLocation } from '@/domain-manager/hooks/useReadWorkspaceUrlFromCurrentLocation';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { lastAuthenticatedWorkspaceDomainState } from '@/domain-manager/states/lastAuthenticatedWorkspaceDomainState';
import { useEffect, useCallback } from 'react';

import { useInitializeQueryParamState } from '@/app/hooks/useInitializeQueryParamState';
import { useGetPublicWorkspaceDataByDomain } from '@/domain-manager/hooks/useGetPublicWorkspaceDataByDomain';
import { useIsCurrentLocationOnDefaultDomain } from '@/domain-manager/hooks/useIsCurrentLocationOnDefaultDomain';
import { isDefined } from 'twenty-shared/utils';
import { type WorkspaceUrls } from '~/generated/graphql';
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

  const { initializeQueryParamState } = useInitializeQueryParamState();

  const isWorkspaceHostnameMatchCurrentLocationHostname = useCallback(
    (workspaceUrls: WorkspaceUrls) => {
      const { hostname } = new URL(getWorkspaceUrl(workspaceUrls));
      return hostname === currentLocationHostname;
    },
    [currentLocationHostname],
  );

  useEffect(() => {
    if (
      isMultiWorkspaceEnabled &&
      isDefined(getPublicWorkspaceData) &&
      !isWorkspaceHostnameMatchCurrentLocationHostname(
        getPublicWorkspaceData.workspaceUrls,
      )
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
    isWorkspaceHostnameMatchCurrentLocationHostname,
  ]);

  useEffect(() => {
    if (
      isMultiWorkspaceEnabled &&
      isDefaultDomain &&
      isDefined(lastAuthenticatedWorkspaceDomain) &&
      'workspaceUrl' in lastAuthenticatedWorkspaceDomain &&
      isDefined(lastAuthenticatedWorkspaceDomain?.workspaceUrl)
    ) {
      initializeQueryParamState();
      redirectToWorkspaceDomain(lastAuthenticatedWorkspaceDomain.workspaceUrl);
    }
  }, [
    isMultiWorkspaceEnabled,
    isDefaultDomain,
    lastAuthenticatedWorkspaceDomain,
    redirectToWorkspaceDomain,
    initializeQueryParamState,
  ]);

  return <></>;
};
