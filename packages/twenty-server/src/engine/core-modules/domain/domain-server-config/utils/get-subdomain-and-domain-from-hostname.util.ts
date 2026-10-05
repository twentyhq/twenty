import { isDefined } from 'twenty-shared/utils';

import { isHostUnderPublicFunctionDomain } from 'src/engine/core-modules/domain/domain-server-config/utils/public-function-domain.util';

export const getSubdomainAndDomainFromHostname = ({
  hostname,
  frontDomain,
  publicBaseDomain,
  defaultSubdomain,
}: {
  hostname: string;
  frontDomain: string;
  publicBaseDomain?: string;
  defaultSubdomain?: string;
}): {
  subdomain: string | undefined;
  domain: string | null;
  isPublicDomainOrigin: boolean;
} => {
  const isFrontDomain =
    hostname === frontDomain || hostname.endsWith(`.${frontDomain}`);

  if (isFrontDomain) {
    const subdomain =
      hostname === frontDomain
        ? undefined
        : hostname.replace(`.${frontDomain}`, '');

    return {
      subdomain: subdomain === defaultSubdomain ? undefined : subdomain,
      domain: null,
      isPublicDomainOrigin: false,
    };
  }

  if (
    isDefined(publicBaseDomain) &&
    isHostUnderPublicFunctionDomain({
      host: hostname,
      publicDomainBaseHostname: publicBaseDomain,
    })
  ) {
    const subdomain = hostname.replace(`.${publicBaseDomain}`, '');

    return {
      subdomain: subdomain === defaultSubdomain ? undefined : subdomain,
      domain: null,
      isPublicDomainOrigin: true,
    };
  }

  return {
    subdomain: undefined,
    domain: hostname,
    isPublicDomainOrigin: false,
  };
};
