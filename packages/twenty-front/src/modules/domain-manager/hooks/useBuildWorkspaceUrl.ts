import { isDefined } from '~/utils/isDefined';
import { domainConfigurationState } from '@/domain-manager/states/domain-configuration.state';
import { useRecoilValue } from 'recoil';

export const useBuildWorkspaceUrl = () => {
  const domainConfiguration = useRecoilValue(domainConfigurationState);

  return (
    subdomain?: string,
    onPage?: string,
    searchParams?: Record<string, string>,
  ) => {
    const url = new URL(window.location.href);

    if (isDefined(subdomain) && subdomain.length !== 0) {
      url.hostname = `${subdomain}.${domainConfiguration.frontDomain}`;
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
  };
};
