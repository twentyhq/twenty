export const normalizeTeamsServiceUrl = (serviceUrl: string): string => {
  const trimmedServiceUrl = serviceUrl.trim();

  try {
    return new URL(trimmedServiceUrl).href.replace(/\/+$/, '');
  } catch {
    return trimmedServiceUrl.replace(/\/+$/, '');
  }
};
