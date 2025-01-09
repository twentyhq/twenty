import { isDefined } from '~/utils/isDefined';
import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { useRecoilValue } from 'recoil';

export const useBuildWorkspaceUrl = () => {
  const domainConfiguration = useRecoilValue(domainConfigurationState);

  const buildWorkspaceUrl = (
    subdomain: string,
    hostname?: string | null,
    pathname?: string,
    searchParams?: Record<string, string>,
  ) => {
    const currentLocation = new URL(window.location.href);

    const url = hostname
      ? // We assume that the protocol and port are the same as those of the current domain.
        new URL(
          `${currentLocation.protocol}//${hostname}${currentLocation.port ? `:${currentLocation.port}` : ''}`,
        )
      : new URL(window.location.href);

    if (!isDefined(hostname) && subdomain.length !== 0) {
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
