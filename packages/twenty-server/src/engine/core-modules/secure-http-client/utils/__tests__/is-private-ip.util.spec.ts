import { isPrivateIp } from 'src/engine/core-modules/secure-http-client/utils/is-private-ip.util';

describe('isPrivateIp', () => {
  describe('loopback addresses', () => {
    it('should detect 127.0.0.1 as private', () => {
      expect(isPrivateIp('127.0.0.1')).toBe(true);
    });

    it('should detect 127.x.x.x range as private', () => {
      expect(isPrivateIp('127.0.0.2')).toBe(true);
      expect(isPrivateIp('127.255.255.255')).toBe(true);
    });

    it('should detect IPv6 loopback ::1 as private', () => {
      expect(isPrivateIp('::1')).toBe(true);
    });

    it('should detect :: (unspecified) as private', () => {
      expect(isPrivateIp('::')).toBe(true);
    });

    it('should detect IPv4-mapped loopback as private', () => {
      expect(isPrivateIp('::ffff:127.0.0.1')).toBe(true);
    });

    it('should detect octal-encoded loopback as private', () => {
      expect(isPrivateIp('0177.0.0.1')).toBe(true);
    });

    it('should detect hex-encoded loopback as private', () => {
      expect(isPrivateIp('0x7f.0.0.1')).toBe(true);
    });
  });

  describe('private IPv4 ranges', () => {
    it('should detect 10.x.x.x range as private', () => {
      expect(isPrivateIp('10.0.0.1')).toBe(true);
      expect(isPrivateIp('10.255.255.255')).toBe(true);
    });

    it('should detect 192.168.x.x range as private', () => {
      expect(isPrivateIp('192.168.0.1')).toBe(true);
      expect(isPrivateIp('192.168.255.255')).toBe(true);
    });

    it('should detect 172.16-31.x.x range as private', () => {
      expect(isPrivateIp('172.16.0.1')).toBe(true);
      expect(isPrivateIp('172.31.255.255')).toBe(true);
    });

    it('should not detect 172.15.x.x as private', () => {
      expect(isPrivateIp('172.15.0.1')).toBe(false);
    });

    it('should not detect 172.32.x.x as private', () => {
      expect(isPrivateIp('172.32.0.1')).toBe(false);
    });

    it('should detect link-local 169.254.x.x as private', () => {
      expect(isPrivateIp('169.254.0.1')).toBe(true);
      expect(isPrivateIp('169.254.169.254')).toBe(true);
    });
  });

  describe('IPv4-mapped IPv6 private addresses', () => {
    it('should detect ::ffff:10.x.x.x as private', () => {
      expect(isPrivateIp('::ffff:10.0.0.1')).toBe(true);
    });

    it('should detect ::ffff:192.168.x.x as private', () => {
      expect(isPrivateIp('::ffff:192.168.1.1')).toBe(true);
    });

    it('should detect ::ffff:172.16.x.x as private', () => {
      expect(isPrivateIp('::ffff:172.16.0.1')).toBe(true);
    });

    it('should detect ::ffff:169.254.x.x as private', () => {
      expect(isPrivateIp('::ffff:169.254.169.254')).toBe(true);
    });
  });

  describe('private IPv6 ranges', () => {
    it('should detect fc00::/7 (unique local) as private', () => {
      expect(isPrivateIp('fc00::1')).toBe(true);
      expect(isPrivateIp('fd00::1')).toBe(true);
    });

    it('should detect fe80::/10 (link-local) as private', () => {
      expect(isPrivateIp('fe80::1')).toBe(true);
    });
  });

  describe('public IP addresses', () => {
    it('should not detect public IPv4 addresses as private', () => {
      expect(isPrivateIp('8.8.8.8')).toBe(false);
      expect(isPrivateIp('1.1.1.1')).toBe(false);
      expect(isPrivateIp('93.184.216.34')).toBe(false);
    });

    it('should not detect 192.167.x.x as private', () => {
      expect(isPrivateIp('192.167.1.1')).toBe(false);
    });

    it('should not detect 11.x.x.x as private', () => {
      expect(isPrivateIp('11.0.0.1')).toBe(false);
    });
  });

  describe('edge cases and bypass attempts', () => {
    it('should handle decimal notation for 127.0.0.1', () => {
      // 127.0.0.1 in decimal = 2130706433
      expect(isPrivateIp('2130706433')).toBe(true);
    });

    it('should handle full decimal notation for loopback', () => {
      // Standard 4-octet loopback address
      expect(isPrivateIp('127.0.0.1')).toBe(true);
    });

    it('should throw on invalid IP', () => {
      expect(() => isPrivateIp('invalid')).toThrow('invalid ipv4 address');
    });

    it('should handle hex-encoded private IPs', () => {
      // 0x7f = 127, so 0x7f.0.0.1 = 127.0.0.1
      expect(isPrivateIp('0x7f.0.0.1')).toBe(true);
    });

    it('should handle standard private IP in 10.x range', () => {
      // Standard 10.x.x.x private range
      expect(isPrivateIp('10.0.0.1')).toBe(true);
    });
  });

  describe('cloud metadata endpoints', () => {
    it('should block AWS/GCP metadata endpoint', () => {
      expect(isPrivateIp('169.254.169.254')).toBe(true);
    });

    it('should block Azure metadata endpoint', () => {
      expect(isPrivateIp('169.254.169.254')).toBe(true);
    });
  });
});
