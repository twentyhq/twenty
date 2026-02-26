import { extractBaseDomain } from 'src/engine/core-modules/domain/utils/extract-base-domain.util';

describe('extractBaseDomain', () => {
  it('should extract base domain from hostname with subdomain', () => {
    expect(extractBaseDomain('app.twenty.com')).toBe('twenty.com');
    expect(extractBaseDomain('workspace.twenty.com')).toBe('twenty.com');
    expect(extractBaseDomain('api.twenty.com')).toBe('twenty.com');
  });

  it('should handle .co.uk TLD', () => {
    expect(extractBaseDomain('twenty.co.uk')).toBe('twenty.co.uk');
    expect(extractBaseDomain('app.twenty.co.uk')).toBe('twenty.co.uk');
    expect(extractBaseDomain('workspace.app.twenty.co.uk')).toBe(
      'twenty.co.uk',
    );
  });

  it('should return localhost for localhost hostname when isDevMode is true', () => {
    expect(extractBaseDomain('localhost', true)).toBe('localhost');
  });

  it('should return IP address for IPv4 addresses when isDevMode is true', () => {
    expect(extractBaseDomain('192.168.1.1', true)).toBe('192.168.1.1');
    expect(extractBaseDomain('127.0.0.1', true)).toBe('127.0.0.1');
    expect(extractBaseDomain('10.0.0.1', true)).toBe('10.0.0.1');
  });

  it('should return null for empty string', () => {
    expect(extractBaseDomain('')).toBe(null);
  });

  it('should return null for invalid hostnames', () => {
    expect(extractBaseDomain('not a valid hostname')).toBe(null);
    expect(extractBaseDomain('...')).toBe(null);
  });

  it('should return null for TLD only', () => {
    expect(extractBaseDomain('com')).toBe(null);
    expect(extractBaseDomain('co.uk')).toBe(null);
  });
});
