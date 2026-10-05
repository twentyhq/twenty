import { ALLOW_ALL_INTERNAL_HOSTS } from 'src/engine/core-modules/secure-http-client/constants/allow-all-internal-hosts.constant';

export const isAllowedInternalHost = (
  host: string,
  allowedInternalHosts: string[],
): boolean =>
  allowedInternalHosts.includes(ALLOW_ALL_INTERNAL_HOSTS) ||
  allowedInternalHosts.includes(host.toLowerCase());
