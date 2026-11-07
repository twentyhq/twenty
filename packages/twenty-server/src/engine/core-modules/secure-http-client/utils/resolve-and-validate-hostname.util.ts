import * as dns from 'dns/promises';

import { getIsBlockedIp } from 'src/engine/core-modules/secure-http-client/utils/get-is-blocked-ip.util';

export const resolveAndValidateHostname = async (
  hostnameOrUrl: string,
  allowedInternalHosts: string[] = [],
  dnsLookup: typeof dns.lookup = dns.lookup,
): Promise<string> => {
  const trimmedHostnameOrUrl = hostnameOrUrl.trim();
  let hostname: string;

  try {
    const url = new URL(trimmedHostnameOrUrl);

    hostname = url.hostname;
  } catch {
    hostname = trimmedHostnameOrUrl;
  }

  const isBlockedIp = getIsBlockedIp(hostname, allowedInternalHosts);

  const { address: resolvedIp } = await dnsLookup(hostname);

  if (isBlockedIp(resolvedIp)) {
    throw new Error(
      `Connection to internal IP address ${resolvedIp} is not allowed.`,
    );
  }

  return resolvedIp;
};
