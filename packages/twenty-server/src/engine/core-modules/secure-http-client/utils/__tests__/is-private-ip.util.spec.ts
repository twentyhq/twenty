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

  describe('this-host addresses (0.0.0.0/8)', () => {
    it('should detect 0.0.0.0 as private', () => {
      expect(isPrivateIp('0.0.0.0')).toBe(true);
    });

    it('should detect 0.x.x.x range as private', () => {
      expect(isPrivateIp('0.0.0.1')).toBe(true);
      expect(isPrivateIp('0.255.255.255')).toBe(true);
    });

    it('should detect decimal 0 (shorthand for 0.0.0.0) as private', () => {
      expect(isPrivateIp('0')).toBe(true);
    });

    it('should detect IPv4-mapped 0.0.0.0 as private', () => {
      expect(isPrivateIp('::ffff:0.0.0.0')).toBe(true);
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

  describe('IPv4-mapped IPv6 in dotted-decimal form', () => {
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

    it('should allow ::ffff:8.8.8.8 (public) through', () => {
      expect(isPrivateIp('::ffff:8.8.8.8')).toBe(false);
    });
  });

  describe('IPv4-mapped IPv6 in hex form (Node.js URL-normalized)', () => {
    it('should detect ::ffff:7f00:1 (127.0.0.1) as private', () => {
      expect(isPrivateIp('::ffff:7f00:1')).toBe(true);
    });

    it('should detect ::ffff:a9fe:a9fe (169.254.169.254) as private', () => {
      expect(isPrivateIp('::ffff:a9fe:a9fe')).toBe(true);
    });

    it('should detect ::ffff:a00:1 (10.0.0.1) as private', () => {
      expect(isPrivateIp('::ffff:a00:1')).toBe(true);
    });

    it('should detect ::ffff:c0a8:101 (192.168.1.1) as private', () => {
      expect(isPrivateIp('::ffff:c0a8:101')).toBe(true);
    });

    it('should detect ::ffff:ac10:1 (172.16.0.1) as private', () => {
      expect(isPrivateIp('::ffff:ac10:1')).toBe(true);
    });

    it('should detect ::ffff:0:0 (0.0.0.0) as private', () => {
      expect(isPrivateIp('::ffff:0:0')).toBe(true);
    });

    it('should allow ::ffff:808:808 (8.8.8.8, public) through', () => {
      expect(isPrivateIp('::ffff:808:808')).toBe(false);
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

  describe('carrier-grade NAT (100.64.0.0/10)', () => {
    it('should detect 100.64.0.0 as private', () => {
      expect(isPrivateIp('100.64.0.0')).toBe(true);
    });

    it('should detect 100.127.255.255 (end of range) as private', () => {
      expect(isPrivateIp('100.127.255.255')).toBe(true);
    });

    it('should not detect 100.63.255.255 (just below range) as private', () => {
      expect(isPrivateIp('100.63.255.255')).toBe(false);
    });

    it('should not detect 100.128.0.0 (just above range) as private', () => {
      expect(isPrivateIp('100.128.0.0')).toBe(false);
    });
  });

  describe('IANA special purpose and documentation ranges', () => {
    it('should detect 192.0.0.0/24 (IANA special purpose) as private', () => {
      expect(isPrivateIp('192.0.0.1')).toBe(true);
    });

    it('should detect 192.0.2.0/24 (TEST-NET-1) as private', () => {
      expect(isPrivateIp('192.0.2.1')).toBe(true);
    });

    it('should detect 198.51.100.0/24 (TEST-NET-2) as private', () => {
      expect(isPrivateIp('198.51.100.1')).toBe(true);
    });

    it('should detect 203.0.113.0/24 (TEST-NET-3) as private', () => {
      expect(isPrivateIp('203.0.113.1')).toBe(true);
    });

    it('should detect 198.18.0.0/15 (benchmarking) as private', () => {
      expect(isPrivateIp('198.18.0.1')).toBe(true);
      expect(isPrivateIp('198.19.255.255')).toBe(true);
    });

    it('should not detect 198.20.0.0 (outside benchmarking) as private', () => {
      expect(isPrivateIp('198.20.0.0')).toBe(false);
    });
  });

  describe('multicast and reserved ranges', () => {
    it('should detect 224.0.0.0/4 (multicast) as private', () => {
      expect(isPrivateIp('224.0.0.1')).toBe(true);
      expect(isPrivateIp('239.255.255.255')).toBe(true);
    });

    it('should detect 240.0.0.0/4 (reserved) as private', () => {
      expect(isPrivateIp('240.0.0.1')).toBe(true);
      expect(isPrivateIp('255.255.255.254')).toBe(true);
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

    it('should not detect public IPv6 as private', () => {
      expect(isPrivateIp('2001:4860:4860::8888')).toBe(false);
    });
  });

  describe('edge cases and bypass attempts', () => {
    it('should handle decimal notation for 127.0.0.1', () => {
      expect(isPrivateIp('2130706433')).toBe(true);
    });

    it('should handle full decimal notation for loopback', () => {
      expect(isPrivateIp('127.0.0.1')).toBe(true);
    });

    it('should throw on invalid IP', () => {
      expect(() => isPrivateIp('invalid')).toThrow('invalid ipv4 address');
    });

    it('should handle hex-encoded private IPs', () => {
      expect(isPrivateIp('0x7f.0.0.1')).toBe(true);
    });

    it('should handle standard private IP in 10.x range', () => {
      expect(isPrivateIp('10.0.0.1')).toBe(true);
    });
  });

  describe('cloud metadata endpoints', () => {
    it('should block AWS/GCP metadata endpoint', () => {
      expect(isPrivateIp('169.254.169.254')).toBe(true);
    });

    it('should block metadata via hex-form IPv4-mapped IPv6', () => {
      expect(isPrivateIp('::ffff:a9fe:a9fe')).toBe(true);
    });

    it('should block metadata via dotted IPv4-mapped IPv6', () => {
      expect(isPrivateIp('::ffff:169.254.169.254')).toBe(true);
    });
  });
});
