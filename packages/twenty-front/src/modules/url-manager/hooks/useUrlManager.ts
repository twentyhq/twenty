import { useMemo, useCallback } from 'react';

import { isDefined } from '~/utils/isDefined';
import { urlManagerState } from '@/url-manager/states/url-manager.state';
import { useRecoilValue } from 'recoil';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';

export const useUrlManager = () => {
  const urlManager = useRecoilValue(urlManagerState);
  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);

  const homePageDomain = useMemo(() => {
    return isMultiWorkspaceEnabled
      ? `${urlManager.defaultSubdomain}.${urlManager.frontDomain}`
      : urlManager.frontDomain;
  }, [
    isMultiWorkspaceEnabled,
    urlManager.defaultSubdomain,
    urlManager.frontDomain,
  ]);

  const isTwentyHomePage = useMemo(() => {
    if (!isMultiWorkspaceEnabled) return true;
    return window.location.hostname === homePageDomain;
  }, [homePageDomain, isMultiWorkspaceEnabled]);

  const isTwentyWorkspaceSubdomain = useMemo(() => {
    if (!isMultiWorkspaceEnabled) return false;

    if (
      !isDefined(urlManager.frontDomain) ||
      !isDefined(urlManager.defaultSubdomain)
    ) {
      throw new Error('frontDomain and defaultSubdomain are required');
    }

    return window.location.hostname !== homePageDomain;
  }, [
    homePageDomain,
    isMultiWorkspaceEnabled,
    urlManager.defaultSubdomain,
    urlManager.frontDomain,
  ]);

  const getWorkspaceSubdomain = useMemo(() => {
    if (!isDefined(urlManager.frontDomain)) {
      throw new Error('frontDomain is not defined');
    }

    return isTwentyWorkspaceSubdomain
      ? window.location.hostname.replace(`.${urlManager.frontDomain}`, '')
      : null;
  }, [isTwentyWorkspaceSubdomain, urlManager.frontDomain]);

  const buildWorkspaceUrl = useCallback(
    (
      subdomain?: string,
      onPage?: string,
      searchParams?: Record<string, string>,
    ) => {
      const url = new URL(window.location.href);

      if (isDefined(subdomain) && subdomain.length !== 0) {
        url.hostname = `${subdomain}.${urlManager.frontDomain}`;
      }

      if (isDefined(onPage)) {
        url.pathname = onPage;
      }

      if (isDefined(searchParams)) {
        Object.entries(searchParams).forEach(([key, value]) =>
          url.searchParams.set(key, value),
        );
      }
      return url.toString();
    },
    [urlManager.frontDomain],
  );

  const redirectToWorkspace = useCallback(
    (
      subdomain: string,
      onPage?: string,
      searchParams?: Record<string, string>,
    ) => {
      if (!isMultiWorkspaceEnabled) return;
      window.location.href = buildWorkspaceUrl(subdomain, onPage, searchParams);
    },
    [buildWorkspaceUrl, isMultiWorkspaceEnabled],
  );

  const redirectToHome = useCallback(() => {
    const url = new URL(window.location.href);
    if (url.hostname !== homePageDomain) {
      url.hostname = homePageDomain;
      window.location.href = url.toString();
    }
  }, [homePageDomain]);

  return {
    redirectToHome,
    redirectToWorkspace,
    homePageDomain,
    isTwentyHomePage,
    buildWorkspaceUrl,
    isTwentyWorkspaceSubdomain,
    getWorkspaceSubdomain,
  };
};
