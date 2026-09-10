import * as dns from 'dns/promises';

import { isAllowedInternalHost } from 'src/engine/core-modules/secure-http-client/utils/is-allowed-internal-host.util';
import {
  isLinkLocalIp,
  isPrivateIp,
} from 'src/engine/core-modules/secure-http-client/utils/is-private-ip.util';

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

  // An allowlisted host may reach private networks but never the link-local
  // range, so a DNS change cannot turn it into a path to the metadata service.
  const isBlockedIp = isAllowedInternalHost(hostname, allowedInternalHosts)
    ? isLinkLocalIp
    : isPrivateIp;

  const { address: resolvedIp } = await dnsLookup(hostname);

  if (isBlockedIp(resolvedIp)) {
    throw new Error(
      `Connection to internal IP address ${resolvedIp} is not allowed.`,
    );
  }

  return resolvedIp;
};
