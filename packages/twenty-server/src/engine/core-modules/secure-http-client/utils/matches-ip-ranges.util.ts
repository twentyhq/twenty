import { isDefined } from 'twenty-shared/utils';
import { type BlockList } from 'net';

const fromLong = (ipl: number): string => {
  return `${ipl >>> 24}.${(ipl >> 16) & 255}.${(ipl >> 8) & 255}.${ipl & 255}`;
};

// Every IPv4 encoding (octal, hex, bare integer) must normalize, or it slips past the range check. -1 means invalid.
const normalizeToLong = (addr: string): number => {
  const parts = addr.split('.').map((part) => {
    if (part.startsWith('0x') || part.startsWith('0X')) {
      return parseInt(part, 16);
    } else if (part.startsWith('0') && part !== '0' && /^[0-7]+$/.test(part)) {
      return parseInt(part, 8);
    } else if (/^[1-9]\d*$/.test(part) || part === '0') {
      return parseInt(part, 10);
    } else {
      return NaN;
    }
  });

  if (parts.some(isNaN)) return -1;

  let val = 0;
  const n = parts.length;
  const [first, second, third, fourth] = parts;

  switch (n) {
    case 1:
      if (!isDefined(first)) return -1;
      val = first;
      break;
    case 2:
      if (!isDefined(first) || !isDefined(second)) return -1;
      if (first > 0xff || second > 0xffffff) return -1;
      val = (first << 24) | (second & 0xffffff);
      break;
    case 3:
      if (!isDefined(first) || !isDefined(second) || !isDefined(third))
        return -1;
      if (first > 0xff || second > 0xff || third > 0xffff) return -1;
      val = (first << 24) | (second << 16) | (third & 0xffff);
      break;
    case 4:
      if (
        !isDefined(first) ||
        !isDefined(second) ||
        !isDefined(third) ||
        !isDefined(fourth)
      )
        return -1;
      if (parts.some((part) => part > 0xff)) return -1;
      val = (first << 24) | (second << 16) | (third << 8) | fourth;
      break;
    default:
      return -1;
  }

  return val >>> 0;
};

const HEX_MAPPED_RE = /^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i;

const extractIpv4FromHexMappedIpv6 = (addr: string): string | null => {
  const match = addr.match(HEX_MAPPED_RE);

  if (!match) {
    return null;
  }

  const [, hiHex, loHex] = match;

  if (!isDefined(hiHex) || !isDefined(loHex)) {
    return null;
  }

  const hi = parseInt(hiHex, 16);
  const lo = parseInt(loHex, 16);

  return `${(hi >> 8) & 0xff}.${hi & 0xff}.${(lo >> 8) & 0xff}.${lo & 0xff}`;
};

const DOTTED_MAPPED_RE = /^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/i;

const extractIpv4FromDottedMappedIpv6 = (addr: string): string | null => {
  const match = addr.match(DOTTED_MAPPED_RE);

  return match?.[1] ?? null;
};

export const matchesIpRanges = (ranges: BlockList, addr: string): boolean => {
  // The form Node's URL parser produces.
  const hexMappedIpv4 = extractIpv4FromHexMappedIpv6(addr);

  if (hexMappedIpv4 !== null) {
    return ranges.check(hexMappedIpv4);
  }

  const dottedMappedIpv4 = extractIpv4FromDottedMappedIpv6(addr);

  if (dottedMappedIpv4 !== null) {
    return ranges.check(dottedMappedIpv4);
  }

  if (addr.includes(':')) {
    return ranges.check(addr, 'ipv6');
  }

  const ipl = normalizeToLong(addr);

  if (ipl < 0) {
    throw new Error('invalid ipv4 address');
  }

  return ranges.check(fromLong(ipl));
};
