import { BlockList, isIPv4 } from 'node:net';

import { isNonEmptyString } from '@sniptt/guards';

const NON_PUBLIC_IPV4_BLOCK_LIST = new BlockList();

NON_PUBLIC_IPV4_BLOCK_LIST.addSubnet('10.0.0.0', 8);
NON_PUBLIC_IPV4_BLOCK_LIST.addSubnet('100.64.0.0', 10);
NON_PUBLIC_IPV4_BLOCK_LIST.addSubnet('127.0.0.0', 8);
NON_PUBLIC_IPV4_BLOCK_LIST.addSubnet('169.254.0.0', 16);
NON_PUBLIC_IPV4_BLOCK_LIST.addSubnet('172.16.0.0', 12);
NON_PUBLIC_IPV4_BLOCK_LIST.addSubnet('192.168.0.0', 16);

export const getForwardedPublicIpv4 = (
  forwardedForHeader: string | undefined,
): string | undefined => {
  if (!isNonEmptyString(forwardedForHeader)) {
    return undefined;
  }

  const [clientIp] = forwardedForHeader.split(',').map((ip) => ip.trim());

  return isIPv4(clientIp) && !NON_PUBLIC_IPV4_BLOCK_LIST.check(clientIp)
    ? clientIp
    : undefined;
};
