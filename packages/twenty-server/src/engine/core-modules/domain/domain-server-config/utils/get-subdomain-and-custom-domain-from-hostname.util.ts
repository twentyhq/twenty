import { isDefined } from 'twenty-shared/utils';

import { isHostUnderPublicFunctionDomain } from 'src/engine/core-modules/domain/domain-server-config/utils/public-function-domain.util';

export const getSubdomainAndCustomDomainFromHostname = ({
  hostname,
  frontDomain,
  serverDomain,
  publicBaseDomain,
  defaultSubdomain,
}: {
  hostname: string;
  frontDomain: string;
  serverDomain?: string;
  publicBaseDomain?: string;
  defaultSubdomain?: string;
}): {
  subdomain: string | undefined;
  customDomain: string | null;
  isUnderPublicDomainUrl: boolean;
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
      customDomain: null,
      isUnderPublicDomainUrl: false,
    };
  }

  // The API host serves the Twenty app itself, even when it sits outside the front domain.
  if (isDefined(serverDomain) && hostname === serverDomain) {
    return {
      subdomain: undefined,
      customDomain: null,
      isUnderPublicDomainUrl: false,
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
      customDomain: null,
      isUnderPublicDomainUrl: true,
    };
  }

  return {
    subdomain: undefined,
    customDomain: hostname,
    isUnderPublicDomainUrl: false,
  };
};
