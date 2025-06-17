export const lowercaseDomainAndRemoveTrailingSlash = (url: string) => {
  try {
    return new URL(url).toString().replace(/\/$/, '');
  } catch {
    return url;
  }
};
