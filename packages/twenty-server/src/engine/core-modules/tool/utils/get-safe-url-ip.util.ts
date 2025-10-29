// Based on code from node-ip by indutny
// Licensed under MIT License
// https://github.com/indutny/node-ip

import dns from 'dns/promises';
import { type URL } from 'url';

const ipv4Regex = /^(\d{1,3}\.){3,3}\d{1,3}$/;
const ipv6Regex =
  /^(::)?(((\d{1,3}\.){3}(\d{1,3}){1})?([0-9a-f]){0,4}:{0,2}){1,8}(::)?$/i;

const fromLong = (ipl: number) => {
  return `${ipl >>> 24}.${(ipl >> 16) & 255}.${(ipl >> 8) & 255}.${ipl & 255}`;
};

const isLoopback = (addr: string) => {
  // If addr is an IPv4 address in long integer form (no dots and no colons), convert it
  if (!/\./.test(addr) && !/:/.test(addr)) {
    addr = fromLong(Number(addr));
  }

  return (
    /^(::f{4}:)?127\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})/.test(addr) ||
    /^0177\./.test(addr) ||
    /^0x7f\./i.test(addr) ||
    /^fe80::1$/i.test(addr) ||
    /^::1$/.test(addr) ||
    /^::$/.test(addr)
  );
};

const normalizeToLong = (addr: string) => {
  const parts = addr.split('.').map((part) => {
    // Handle hexadecimal format
    if (part.startsWith('0x') || part.startsWith('0X')) {
      return parseInt(part, 16);
    }
    // Handle octal format (strictly digits 0-7 after a leading zero)
    else if (part.startsWith('0') && part !== '0' && /^[0-7]+$/.test(part)) {
      return parseInt(part, 8);
    }
    // Handle decimal format, reject invalid leading zeros
    else if (/^[1-9]\d*$/.test(part) || part === '0') {
      return parseInt(part, 10);
    }
    // Return NaN for invalid formats to indicate parsing failure
    else {
      return NaN;
    }
  });

  if (parts.some(isNaN)) return -1; // Indicate error with -1

  let val = 0;
  const n = parts.length;

  switch (n) {
    case 1:
      val = parts[0];
      break;
    case 2:
      if (parts[0] > 0xff || parts[1] > 0xffffff) return -1;
      val = (parts[0] << 24) | (parts[1] & 0xffffff);
      break;
    case 3:
      if (parts[0] > 0xff || parts[1] > 0xff || parts[2] > 0xffff) return -1;
      val = (parts[0] << 24) | (parts[1] << 16) | (parts[2] & 0xffff);
      break;
    case 4:
      if (parts.some((part) => part > 0xff)) return -1;
      val = (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];
      break;
    default:
      return -1; // Error case
  }

  return val >>> 0;
};

const isIpV4 = (hostname: string) => ipv4Regex.test(hostname);
const isIpV6 = (hostname: string) => ipv6Regex.test(hostname);

const isPrivateIP = (addr: string) => {
  // check loopback addresses first
  if (isLoopback(addr)) {
    return true;
  }

  // ensure the ipv4 address is valid
  if (!isIpV6(addr)) {
    const ipl = normalizeToLong(addr);

    if (ipl < 0) {
      throw new Error('invalid ipv4 address');
    }
    // normalize the address for the private range checks that follow
    addr = fromLong(ipl);
  }

  // check private ranges
  return (
    /^(::f{4}:)?10\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(addr) ||
    /^(::f{4}:)?192\.168\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(addr) ||
    /^(::f{4}:)?172\.(1[6-9]|2\d|30|31)\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(
      addr,
    ) ||
    /^(::f{4}:)?169\.254\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(addr) ||
    /^f[cd][0-9a-f]{2}:/i.test(addr) ||
    /^fe80:/i.test(addr) ||
    /^::1$/.test(addr) ||
    /^::$/.test(addr)
  );
};

export const getSafeUrlIP = async (url: URL): Promise<string> => {
  const hostname = url.hostname.toLowerCase();
  let resolvedIPs = [];

  if (isIpV4(hostname) || isIpV6(hostname)) {
    resolvedIPs = [hostname];
  } else {
    try {
      const [ipv4Addresses, ipv6Addresses] = await Promise.allSettled([
        dns.resolve4(hostname),
        dns.resolve6(hostname),
      ]);

      if (ipv4Addresses.status === 'fulfilled') {
        resolvedIPs.push(...ipv4Addresses.value);
      }
      if (ipv6Addresses.status === 'fulfilled') {
        resolvedIPs.push(...ipv6Addresses.value);
      }

      if (resolvedIPs.length === 0) {
        throw new Error('Could not resolve hostname');
      }
    } catch (err) {
      throw new Error(`DNS resolution failed: ${err.message}`);
    }
  }

  for (const ip of resolvedIPs) {
    if (isPrivateIP(ip)) {
      throw new Error('Private IP address');
    }
  }

  return resolvedIPs[0];
};
