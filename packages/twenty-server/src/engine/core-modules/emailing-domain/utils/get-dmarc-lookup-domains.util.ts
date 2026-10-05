import psl from 'psl';
import { isDefined } from 'twenty-shared/utils';

export const getDmarcLookupDomains = (domain: string): string[] => {
  const organizationalDomain = psl.get(domain);

  if (!isDefined(organizationalDomain) || organizationalDomain === domain) {
    return [domain];
  }

  return [domain, organizationalDomain];
};
