import { isAllowedInternalHost } from 'src/engine/core-modules/secure-http-client/utils/is-allowed-internal-host.util';
import { isLinkLocalIp } from 'src/engine/core-modules/secure-http-client/utils/is-link-local-ip.util';
import { isPrivateIp } from 'src/engine/core-modules/secure-http-client/utils/is-private-ip.util';

// Allowlisted hosts never reach link-local, so a DNS change cannot expose the metadata service.
export const getIsBlockedIp = (
  host: string | undefined,
  allowedInternalHosts: string[],
): ((address: string) => boolean) =>
  host && isAllowedInternalHost(host, allowedInternalHosts)
    ? isLinkLocalIp
    : isPrivateIp;
