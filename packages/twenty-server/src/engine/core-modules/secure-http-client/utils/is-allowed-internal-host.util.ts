export const ALLOW_ALL_INTERNAL_HOSTS = '*';

// Operators paste whatever they have at hand (a bare host, host:port or the
// full issuer URL); connections are matched on the hostname alone.
export const normalizeAllowedInternalHost = (entry: string): string => {
  const trimmed = entry.trim();

  try {
    return new URL(
      trimmed.includes('://') ? trimmed : `http://${trimmed}`,
    ).hostname.replace(/^\[|\]$/g, '');
  } catch {
    return trimmed.toLowerCase();
  }
};

export const isAllowedInternalHost = (
  host: string,
  allowedInternalHosts: string[],
): boolean =>
  allowedInternalHosts.includes(ALLOW_ALL_INTERNAL_HOSTS) ||
  allowedInternalHosts.includes(host.toLowerCase());
