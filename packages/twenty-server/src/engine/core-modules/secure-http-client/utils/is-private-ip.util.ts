// Based on code from node-ip by indutny
// Licensed under MIT License
// https://github.com/indutny/node-ip

const ipv6Regex =
  /^(::)?(((\d{1,3}\.){3}(\d{1,3}){1})?([0-9a-f]){0,4}:{0,2}){1,8}(::)?$/i;

const fromLong = (ipl: number) => {
  return `${ipl >>> 24}.${(ipl >> 16) & 255}.${(ipl >> 8) & 255}.${ipl & 255}`;
};

const isLoopback = (addr: string) => {
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
      return -1;
  }

  return val >>> 0;
};

const isIpV6 = (hostname: string) => ipv6Regex.test(hostname);

export const isPrivateIp = (addr: string) => {
  if (isLoopback(addr)) {
    return true;
  }

  if (!isIpV6(addr)) {
    const ipl = normalizeToLong(addr);

    if (ipl < 0) {
      throw new Error('invalid ipv4 address');
    }
    addr = fromLong(ipl);
  }

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
