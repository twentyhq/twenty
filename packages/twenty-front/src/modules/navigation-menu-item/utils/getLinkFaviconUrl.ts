import { getLogoUrlFromDomainName } from 'twenty-shared/utils';

export const getLinkFaviconUrl = (
  link: string | null | undefined,
): string | undefined => {
  const trimmed = (link ?? '').trim();
  if (!trimmed) {
    return undefined;
  }
  const normalized =
    trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`;
  try {
    const hostname = new URL(normalized).hostname;
    return getLogoUrlFromDomainName(hostname);
  } catch {
    return undefined;
  }
};
