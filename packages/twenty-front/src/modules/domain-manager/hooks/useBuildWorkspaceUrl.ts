import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { useRecoilValue } from 'recoil';
import { isDefined } from '~/utils/isDefined';

export const useBuildWorkspaceUrl = () => {
  const domainConfiguration = useRecoilValue(domainConfigurationState);

  const buildWorkspaceUrl = (
    subdomain?: string,
    pathname?: string,
    searchParams?: Record<string, string>,
  ) => {
    const url = new URL(window.location.href);

    if (isDefined(subdomain) && subdomain.length !== 0) {
      url.hostname = `${subdomain}.${domainConfiguration.frontDomain}`;
    }

    if (isDefined(pathname)) {
      url.pathname = pathname;
    }

    if (isDefined(searchParams)) {
      Object.entries(searchParams).forEach(([key, value]) =>
        url.searchParams.set(key, value),
      );
    }
    return url.toString();
  };

  return {
    buildWorkspaceUrl,
  };
};
