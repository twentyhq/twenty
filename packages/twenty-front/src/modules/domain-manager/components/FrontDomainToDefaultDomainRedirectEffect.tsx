import { useReadDefaultDomainFromConfiguration } from '@/domain-manager/hooks/useReadDefaultDomainFromConfiguration';
import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { useEffect } from 'react';

export const FrontDomainToDefaultDomainRedirectEffect = () => {
  const { defaultDomain } = useReadDefaultDomainFromConfiguration();
  const { redirect } = useRedirect();

  useEffect(() => {
    const url = new URL(window.location.href);
    url.hostname = defaultDomain;
    redirect(url.toString());
  }, [defaultDomain, redirect]);

  return null;
};
