import { isNonEmptyString } from '@sniptt/guards';

const FAVICON_SIZE = 64;

export const getCompanyFaviconUrl = (
  domainUrl: string | null | undefined,
): string | undefined => {
  if (!isNonEmptyString(domainUrl)) {
    return undefined;
  }

  try {
    const hostname = new URL(
      domainUrl.includes('://') ? domainUrl : `https://${domainUrl}`,
    ).hostname;

    if (!isNonEmptyString(hostname)) {
      return undefined;
    }

    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=${FAVICON_SIZE}`;
  } catch {
    return undefined;
  }
};
