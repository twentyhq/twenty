import { isAllowedInternalHost } from 'src/engine/core-modules/secure-http-client/utils/is-allowed-internal-host.util';
import { isLinkLocalIp } from 'src/engine/core-modules/secure-http-client/utils/is-link-local-ip.util';
import { isPrivateIp } from 'src/engine/core-modules/secure-http-client/utils/is-private-ip.util';

// An allowlisted host may reach private networks but never the link-local
// range, so a DNS change cannot turn it into a path to the metadata service.
export const getIsBlockedIp = (
  host: string | undefined,
  allowedInternalHosts: string[],
): ((address: string) => boolean) =>
  host && isAllowedInternalHost(host, allowedInternalHosts)
    ? isLinkLocalIp
    : isPrivateIp;
