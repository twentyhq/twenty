import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useReadWorkspaceUrlFromCurrentLocation } from '@/domain-manager/hooks/useReadWorkspaceUrlFromCurrentLocation';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { lastAuthenticatedWorkspaceDomainState } from '@/domain-manager/states/lastAuthenticatedWorkspaceDomainState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useStore } from 'jotai';
import { useEffect, useCallback } from 'react';

import { useInitializeQueryParamState } from '@/app/hooks/useInitializeQueryParamState';
import { useGetPublicWorkspaceDataByDomain } from '@/domain-manager/hooks/useGetPublicWorkspaceDataByDomain';
import { useIsCurrentLocationOnDefaultDomain } from '@/domain-manager/hooks/useIsCurrentLocationOnDefaultDomain';
import { isStayingOnDefaultDomainState } from '@/domain-manager/states/isStayingOnDefaultDomainState';
import { getIsStayingOnDefaultDomainAfterPageLoad } from '@/domain-manager/utils/getIsStayingOnDefaultDomainAfterPageLoad';
import { isStayOnDefaultDomainRequested } from '@/domain-manager/utils/isStayOnDefaultDomainRequested';
import { isDefined } from 'twenty-shared/utils';
import { type WorkspaceUrls } from '~/generated-metadata/graphql';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';

const getCurrentSearchParams = (): Record<string, string> =>
  Object.fromEntries(new URLSearchParams(window.location.search));

export const WorkspaceProviderEffect = () => {
  const { data: getPublicWorkspaceData } = useGetPublicWorkspaceDataByDomain();

  const lastAuthenticatedWorkspaceDomain = useAtomStateValue(
    lastAuthenticatedWorkspaceDomainState,
  );

  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();
  const { isDefaultDomain } = useIsCurrentLocationOnDefaultDomain();

  const { currentLocationHostname } = useReadWorkspaceUrlFromCurrentLocation();

  const isMultiWorkspaceEnabled = useAtomStateValue(
    isMultiWorkspaceEnabledState,
  );

  const { initializeQueryParamState } = useInitializeQueryParamState();
  const store = useStore();

  const isWorkspaceHostnameMatchCurrentLocationHostname = useCallback(
    (workspaceUrls: WorkspaceUrls) => {
      const { hostname } = new URL(getWorkspaceUrl(workspaceUrls));
      return hostname === currentLocationHostname;
    },
    [currentLocationHostname],
  );

  // Runs before SignInUpSsoExchangeTokenEffect strips the social SSO return hash
  useEffect(() => {
    store.set(
      isStayingOnDefaultDomainState.atom,
      getIsStayingOnDefaultDomainAfterPageLoad({
        isStayingOnDefaultDomain: store.get(isStayingOnDefaultDomainState.atom),
      }),
    );
  }, [store]);

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
        window.location.pathname,
        getCurrentSearchParams(),
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
      !isStayOnDefaultDomainRequested({
        isStayingOnDefaultDomain: store.get(isStayingOnDefaultDomainState.atom),
      }) &&
      isDefined(lastAuthenticatedWorkspaceDomain) &&
      'workspaceUrl' in lastAuthenticatedWorkspaceDomain &&
      isDefined(lastAuthenticatedWorkspaceDomain?.workspaceUrl)
    ) {
      initializeQueryParamState();
      redirectToWorkspaceDomain(
        lastAuthenticatedWorkspaceDomain.workspaceUrl,
        window.location.pathname,
        getCurrentSearchParams(),
      );
    }
  }, [
    isMultiWorkspaceEnabled,
    isDefaultDomain,
    lastAuthenticatedWorkspaceDomain,
    redirectToWorkspaceDomain,
    initializeQueryParamState,
    store,
  ]);

  return <></>;
};
