export const normalizeTeamsServiceUrl = (serviceUrl: string): string =>
  serviceUrl.trim().replace(/\/+$/, '');
