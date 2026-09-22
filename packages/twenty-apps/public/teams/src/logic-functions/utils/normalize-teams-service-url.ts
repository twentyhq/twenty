export const normalizeTeamsServiceUrl = (serviceUrl: string): string => {
  const trimmedServiceUrl = serviceUrl.trim();

  try {
    // parsing lowercases the scheme and host, which are case-insensitive,
    // and leaves the path alone
    return new URL(trimmedServiceUrl).href.replace(/\/+$/, '');
  } catch {
    return trimmedServiceUrl.replace(/\/+$/, '');
  }
};
