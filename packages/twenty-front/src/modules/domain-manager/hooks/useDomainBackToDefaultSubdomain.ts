import { useDefaultDomain } from '@/domain-manager/hooks/useDefaultDomain';

export const useDomainBackToDefaultSubdomain = () => {
  const { defaultDomain } = useDefaultDomain();
  return () => {
    const url = new URL(window.location.href);
    if (url.hostname !== defaultDomain) {
      url.hostname = defaultDomain;
      window.location.href = url.toString();
    }
  };
};
