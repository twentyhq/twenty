// Mirrors twenty-shared's getLinkFaviconUrl (not a dependency of this app):
// Twenty serves company logos from twenty-icons.com, which is public, so
// Slack can fetch them for the record cards.
export const getCompanyLogoUrl = (
  domainUrl: string | undefined,
): string | undefined => {
  const trimmed = (domainUrl ?? '').trim();

  if (!trimmed) {
    return undefined;
  }

  const normalized =
    trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`;

  try {
    const hostname = new URL(normalized).hostname.replace(/^www\./, '');

    return hostname ? `https://twenty-icons.com/${hostname}` : undefined;
  } catch {
    return undefined;
  }
};
