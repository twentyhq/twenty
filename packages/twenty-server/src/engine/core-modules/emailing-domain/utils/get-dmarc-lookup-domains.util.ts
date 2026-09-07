import psl from 'psl';

export const getDmarcLookupDomains = (domain: string): string[] => {
  const parsed = psl.parse(domain);
  const organizationalDomain =
    'domain' in parsed && parsed.domain !== null ? parsed.domain : null;

  if (organizationalDomain === null || organizationalDomain === domain) {
    return [domain];
  }

  return [domain, organizationalDomain];
};
