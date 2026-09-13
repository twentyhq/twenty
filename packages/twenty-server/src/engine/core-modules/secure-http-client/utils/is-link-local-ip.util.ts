import { BlockList } from 'net';

import { matchesIpRanges } from 'src/engine/core-modules/secure-http-client/utils/matches-ip-ranges.util';

// Cloud metadata services (169.254.169.254, ECS/EKS task credentials) live in
// the link-local range, so it is never opened by the internal host allowlist.
const LINK_LOCAL_RANGES = new BlockList();

LINK_LOCAL_RANGES.addSubnet('169.254.0.0', 16);
LINK_LOCAL_RANGES.addSubnet('fe80::', 10, 'ipv6');

export const isLinkLocalIp = (addr: string): boolean =>
  matchesIpRanges(LINK_LOCAL_RANGES, addr);
