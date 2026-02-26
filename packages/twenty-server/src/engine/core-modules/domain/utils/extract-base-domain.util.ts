import psl from 'psl';

import { isParsedDomain } from 'src/modules/contact-creation-manager/types/is-psl-parsed-domain.type';

const isLocalhost = (hostname: string): boolean => {
  return hostname === 'localhost' || hostname.startsWith('localhost:');
};

const isIpAddress = (hostname: string): boolean => {
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}(:\d+)?$/;
  const ipv6Pattern = /^\[?([a-fA-F0-9:]+)\]?(:\d+)?$/;

  return ipv4Pattern.test(hostname) || ipv6Pattern.test(hostname);
};

export const extractBaseDomain = (
  hostname: string,
  isDevMode = false,
): string | null => {
  if (isDevMode && isLocalhost(hostname)) {
    return 'localhost';
  }

  if (isDevMode && isIpAddress(hostname)) {
    return hostname.replace(/:\d+$/, '');
  }

  const result = psl.parse(hostname);

  if (!isParsedDomain(result)) {
    return null;
  }

  return result.domain;
};
