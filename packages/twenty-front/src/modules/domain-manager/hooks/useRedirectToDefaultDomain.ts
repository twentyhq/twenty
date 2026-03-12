import { returnToPathState } from '@/auth/states/returnToPathState';
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
  const redirectToDefaultDomain = () => {
    const url = new URL(window.location.href);
    if (url.hostname !== defaultDomain) {
      setLastAuthenticateWorkspaceDomain(null);

      const returnToPath = store.get(returnToPathState.atom);
      if (isNonEmptyString(returnToPath) && !url.searchParams.has('returnToPath')) {
        url.searchParams.set('returnToPath', returnToPath);
      }

      url.hostname = defaultDomain;
      redirect(url.toString());
    }
  };

  return {
    redirectToDefaultDomain,
  };
};
