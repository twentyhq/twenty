import { isDefined } from 'twenty-sdk/utils';

export const LINKEDIN_DOMAINS = ['linkedin.com'];

export const readHostname = (rawUrl: string): string | undefined => {
  try {
    return new URL(
      rawUrl.includes('://') ? rawUrl : `https://${rawUrl}`,
    ).hostname.toLowerCase();
  } catch {
    return undefined;
  }
};

export const isUrlOnOneOfDomains = (
  rawUrl: string,
  domains: string[],
): boolean => {
  const hostname = readHostname(rawUrl);

  if (!isDefined(hostname)) {
    return false;
  }

  return domains.some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
  );
};
