export const extractDomainFromUrl = (url: string): string | undefined => {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, '') || undefined;
  } catch {
    return undefined;
  }
};
