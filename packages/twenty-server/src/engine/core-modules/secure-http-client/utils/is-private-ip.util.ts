import { BlockList } from 'net';

import { matchesIpRanges } from 'src/engine/core-modules/secure-http-client/utils/matches-ip-ranges.util';

const PRIVATE_RANGES = new BlockList();

PRIVATE_RANGES.addSubnet('0.0.0.0', 8);
PRIVATE_RANGES.addSubnet('10.0.0.0', 8);
PRIVATE_RANGES.addSubnet('100.64.0.0', 10);
PRIVATE_RANGES.addSubnet('127.0.0.0', 8);
PRIVATE_RANGES.addSubnet('169.254.0.0', 16);
PRIVATE_RANGES.addSubnet('172.16.0.0', 12);
PRIVATE_RANGES.addSubnet('192.0.0.0', 24);
PRIVATE_RANGES.addSubnet('192.0.2.0', 24);
PRIVATE_RANGES.addSubnet('192.168.0.0', 16);
PRIVATE_RANGES.addSubnet('198.18.0.0', 15);
PRIVATE_RANGES.addSubnet('198.51.100.0', 24);
PRIVATE_RANGES.addSubnet('203.0.113.0', 24);
PRIVATE_RANGES.addSubnet('224.0.0.0', 4);
PRIVATE_RANGES.addSubnet('240.0.0.0', 4);

PRIVATE_RANGES.addSubnet('::1', 128, 'ipv6');
PRIVATE_RANGES.addSubnet('::', 128, 'ipv6');
PRIVATE_RANGES.addSubnet('fc00::', 7, 'ipv6');
PRIVATE_RANGES.addSubnet('fe80::', 10, 'ipv6');

export const isPrivateIp = (addr: string): boolean =>
  matchesIpRanges(PRIVATE_RANGES, addr);
