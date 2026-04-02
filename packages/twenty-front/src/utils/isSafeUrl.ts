const SAFE_URL_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:'];

export const isSafeUrl = (url: string): boolean => {
  if (url.startsWith('/') && !url.startsWith('//')) {
    return true;
  }

  try {
    const parsed = new URL(url);

    return SAFE_URL_PROTOCOLS.includes(parsed.protocol);
  } catch {
    return false;
  }
};

// Returns the URL if already safe, otherwise tries prefixing https://
export const getSafeUrl = (url: string): string | undefined => {
  if (isSafeUrl(url)) {
    return url;
  }

  const withScheme = `https://${url}`;

  return isSafeUrl(withScheme) ? withScheme : undefined;
};
