import { isNonEmptyString } from '@sniptt/guards';

export const getCompanyLogoUrl = (
  domainUrl: string | undefined,
): string | undefined => {
  const trimmed = (domainUrl ?? '').trim();

  if (!isNonEmptyString(trimmed)) {
    return undefined;
  }

  const normalized = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const hostname = new URL(normalized).hostname.replace(/^www\./, '');

    return isNonEmptyString(hostname)
      ? `https://twenty-icons.com/${hostname}`
      : undefined;
  } catch {
    return undefined;
  }
};
