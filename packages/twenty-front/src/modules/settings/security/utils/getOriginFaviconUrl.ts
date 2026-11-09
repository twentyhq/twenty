import {
  getLogoUrlFromDomainName,
  isValidDomain,
  normalizeDomain,
} from 'twenty-shared/utils';

import { PRIVATE_DOMAIN_SUFFIXES } from '@/settings/security/constants/PrivateDomainSuffixes';

export const getOriginFaviconUrl = ({
  origin,
  allowRequestsToTwentyIcons,
}: {
  origin: string;
  allowRequestsToTwentyIcons: boolean;
}) => {
  const domain = normalizeDomain(origin);

  const isPrivateDomain = PRIVATE_DOMAIN_SUFFIXES.some((suffix) =>
    domain.endsWith(`.${suffix}`),
  );

  if (
    !allowRequestsToTwentyIcons ||
    isPrivateDomain ||
    !isValidDomain(domain)
  ) {
    return undefined;
  }

  return getLogoUrlFromDomainName(domain);
};
