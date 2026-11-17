import { isDefined } from 'twenty-shared/utils';

// URL canonicalises [::ffff:127.0.0.1] to hex, so only that spelling reaches here; all of 127.0.0.0/8 is loopback.
const IPV4_LOOPBACK_REGEX = /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
const IPV4_MAPPED_HEX_REGEX = /^::ffff:([0-9a-f]{1,4}):[0-9a-f]{1,4}$/;

export const isLoopbackHostname = (hostname: string): boolean => {
  // A trailing DNS dot (localhost.) resolves the same but would not match.
  const host = hostname
    .replace(/^\[|\]$/g, '')
    .replace(/\.$/, '')
    .toLowerCase();

  if (host === 'localhost' || host === '::1') {
    return true;
  }

  if (IPV4_LOOPBACK_REGEX.test(host)) {
    return true;
  }

  const mappedHex = IPV4_MAPPED_HEX_REGEX.exec(host);

  // The high byte of the first hextet is the first octet of the v4 address.
  return isDefined(mappedHex) && Number.parseInt(mappedHex[1], 16) >> 8 === 127;
};
