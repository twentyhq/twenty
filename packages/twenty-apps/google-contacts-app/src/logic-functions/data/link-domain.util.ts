import { isDefined } from 'twenty-sdk/utils';

export const X_DOMAINS = ['x.com', 'twitter.com'];
export const LINKEDIN_DOMAINS = ['linkedin.com'];

const readHostname = (rawUrl: string): string | undefined => {
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
