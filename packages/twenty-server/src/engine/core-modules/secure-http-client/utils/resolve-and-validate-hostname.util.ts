import * as dns from 'dns/promises';

import { isAllowedInternalHost } from 'src/engine/core-modules/secure-http-client/utils/is-allowed-internal-host.util';
import { isPrivateIp } from 'src/engine/core-modules/secure-http-client/utils/is-private-ip.util';

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

  if (isAllowedInternalHost(hostname, allowedInternalHosts)) {
    return hostnameOrUrl;
  }

  const { address: resolvedIp } = await dnsLookup(hostname);

  if (isPrivateIp(resolvedIp)) {
    throw new Error(
      `Connection to internal IP address ${resolvedIp} is not allowed.`,
    );
  }

  return resolvedIp;
};
