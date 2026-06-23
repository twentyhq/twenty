import { isNonEmptyString } from '@sniptt/guards';

export const getHostnameFromUrlOrUndefined = (
  url?: string | null,
): string | undefined => {
  if (!isNonEmptyString(url)) {
    return undefined;
  }

  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return undefined;
  }
};

// A request host is an "isolated public function domain" when it is a strict
// subdomain of the configured public domain base (e.g. acme.withtwenty.com
// under withtwenty.com). The base apex itself is excluded: it is only used as
// the CNAME target / ingress for registered public domains, never to serve a
// workspace's logic functions.
export const isHostUnderPublicFunctionDomain = ({
  host,
  publicDomainBaseHostname,
}: {
  host?: string | null;
  publicDomainBaseHostname?: string;
}): boolean => {
  if (!isNonEmptyString(host) || !isNonEmptyString(publicDomainBaseHostname)) {
    return false;
  }

  const hostname = host.split(':')[0].toLowerCase();
  const base = publicDomainBaseHostname.toLowerCase();

  return hostname !== base && hostname.endsWith(`.${base}`);
};
