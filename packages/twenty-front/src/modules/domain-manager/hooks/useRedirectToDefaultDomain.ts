import { useReadDefaultDomainFromConfiguration } from '@/domain-manager/hooks/useReadDefaultDomainFromConfiguration';

export const useRedirectToDefaultDomain = () => {
  const { defaultDomain } = useReadDefaultDomainFromConfiguration();
  const redirectToDefaultDomain = () => {
    const url = new URL(window.location.href);
    if (url.hostname !== defaultDomain) {
      url.hostname = defaultDomain;
      window.location.href = url.toString();
    }
  };

  return {
    redirectToDefaultDomain,
  };
};
