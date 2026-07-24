export const isExternalNavigationUrl = (href: string): boolean => {
  try {
    const resolvedUrl = new URL(href, window.location.href);

    if (resolvedUrl.protocol !== 'http:' && resolvedUrl.protocol !== 'https:') {
      return false;
    }

    return resolvedUrl.origin !== window.location.origin;
  } catch {
    return false;
  }
};
