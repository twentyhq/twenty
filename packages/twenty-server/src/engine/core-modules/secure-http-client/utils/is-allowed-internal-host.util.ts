export const ALLOW_ALL_INTERNAL_HOSTS = '*';

// Hosts are matched before DNS resolution, so an entry is either a hostname
// or an IP literal exactly as it appears in the connection settings.
export const isAllowedInternalHost = (
  host: string,
  allowedInternalHosts: string[],
): boolean =>
  allowedInternalHosts.includes(ALLOW_ALL_INTERNAL_HOSTS) ||
  allowedInternalHosts.includes(host.toLowerCase());
