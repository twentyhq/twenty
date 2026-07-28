export const getExternalLinkDisplayUrl = (url: string) => {
  try {
    const { host, pathname, search, hash } = new URL(url);

    const displayedHost = host.startsWith('www.') ? host.slice(4) : host;
    const displayedPathname = pathname === '/' ? '' : pathname;

    return `${displayedHost}${displayedPathname}${search}${hash}`;
  } catch {
    return url;
  }
};
