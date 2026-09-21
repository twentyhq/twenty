import { returnToPathState } from '@/auth/states/returnToPathState';
import { STAY_ON_DEFAULT_DOMAIN_SEARCH_PARAM } from '@/domain-manager/constants/StayOnDefaultDomainSearchParam';
import { useLastAuthenticatedWorkspaceDomain } from '@/domain-manager/hooks/useLastAuthenticatedWorkspaceDomain';
import { useReadDefaultDomainFromConfiguration } from '@/domain-manager/hooks/useReadDefaultDomainFromConfiguration';
import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { isNonEmptyString } from '@sniptt/guards';
import { useStore } from 'jotai';

export const useRedirectToDefaultDomain = () => {
  const { defaultDomain } = useReadDefaultDomainFromConfiguration();
  const { setLastAuthenticateWorkspaceDomain } =
    useLastAuthenticatedWorkspaceDomain();
  const store = useStore();

  const { redirect } = useRedirect();
  const redirectToDefaultDomain = (options?: {
    pathname?: string;
    searchParams?: Record<string, string>;
  }) => {
    const url = new URL(window.location.href);
    if (url.hostname !== defaultDomain) {
      setLastAuthenticateWorkspaceDomain(null);

      // Clearing the cookie is not enough: it only reaches cookies scoped to
      // the front domain, and the default domain also resumes an existing
      // session into its workspace. This marks the navigation as deliberate so
      // both auto-redirects stand down.
      url.searchParams.set(STAY_ON_DEFAULT_DOMAIN_SEARCH_PARAM, 'true');

      const returnToPath = store.get(returnToPathState.atom);
      if (
        isNonEmptyString(returnToPath) &&
        !url.searchParams.has('returnToPath')
      ) {
        url.searchParams.set('returnToPath', returnToPath);
      }

      if (isNonEmptyString(options?.pathname)) {
        url.pathname = options.pathname;
      }

      Object.entries(options?.searchParams ?? {}).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });

      url.hostname = defaultDomain;
      redirect(url.toString());
    }
  };

  return {
    redirectToDefaultDomain,
  };
};
