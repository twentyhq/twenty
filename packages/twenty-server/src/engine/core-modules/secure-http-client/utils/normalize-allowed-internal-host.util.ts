// Operators paste a bare host, host:port or full issuer URL; connections match on the hostname alone.
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
