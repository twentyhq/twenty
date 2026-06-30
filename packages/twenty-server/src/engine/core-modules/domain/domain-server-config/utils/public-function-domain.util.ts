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
