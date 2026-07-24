import { isExternalNavigationUrl } from '../isExternalNavigationUrl';

describe('isExternalNavigationUrl (jest jsdom test page origin is http://localhost)', () => {
  it('should return true for a cross-origin https url', () => {
    expect(isExternalNavigationUrl('https://example.com/probe')).toBe(true);
  });

  it('should return true for a cross-origin http url', () => {
    expect(isExternalNavigationUrl('http://example.com')).toBe(true);
  });

  it('should return false for a same-origin absolute url', () => {
    expect(isExternalNavigationUrl('http://localhost/settings')).toBe(false);
  });

  it('should return false for a relative path', () => {
    expect(isExternalNavigationUrl('/objects/people')).toBe(false);
  });

  it('should return false for a mailto url', () => {
    expect(isExternalNavigationUrl('mailto:hello@example.com')).toBe(false);
  });

  it('should return false for a tel url', () => {
    expect(isExternalNavigationUrl('tel:+15551234567')).toBe(false);
  });

  it('should return false for a javascript url', () => {
    expect(isExternalNavigationUrl('javascript:alert(1)')).toBe(false);
  });

  it('should return false for an empty href', () => {
    expect(isExternalNavigationUrl('')).toBe(false);
  });
});
