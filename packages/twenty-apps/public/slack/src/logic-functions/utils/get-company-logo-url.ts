import { isNonEmptyString } from '@sniptt/guards';

export const getCompanyLogoUrl = (
  domainUrl: string | undefined,
): string | undefined => {
  const trimmed = (domainUrl ?? '').trim();

  if (!isNonEmptyString(trimmed)) {
    return undefined;
  }

  const normalized =
    trimmed.startsWith('http://') || trimmed.startsWith('https://')
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
