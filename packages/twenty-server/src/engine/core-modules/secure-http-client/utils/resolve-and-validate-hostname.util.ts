import * as dns from 'dns/promises';

import { getIsBlockedIp } from 'src/engine/core-modules/secure-http-client/utils/is-allowed-internal-host.util';

export const resolveAndValidateHostname = async (
  hostnameOrUrl: string,
  allowedInternalHosts: string[] = [],
  dnsLookup: typeof dns.lookup = dns.lookup,
): Promise<string> => {
  let hostname: string;

  try {
    const url = new URL(hostnameOrUrl);

    hostname = url.hostname;
  } catch {
    hostname = hostnameOrUrl;
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
