import { useReadDefaultDomainFromConfiguration } from '@/domain-manager/hooks/useReadDefaultDomainFromConfiguration';
import { useRedirect } from '@/domain-manager/hooks/useRedirect';

export const useRedirectToDefaultDomain = () => {
  const { defaultDomain } = useReadDefaultDomainFromConfiguration();
  const { redirect } = useRedirect();
  const redirectToDefaultDomain = () => {
    const url = new URL(window.location.href);
    if (url.hostname !== defaultDomain) {
      url.hostname = defaultDomain;
      redirect(url.toString());
    }
  };

  return {
    redirectToDefaultDomain,
  };
};
