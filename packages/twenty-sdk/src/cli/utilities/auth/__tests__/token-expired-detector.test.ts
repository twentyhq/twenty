import { isTokenExpiredMessage } from '../token-expired-detector';

describe('isTokenExpiredMessage', () => {
  it.each([
    'Token has expired.',
    'Upload failed: Token has expired.',
    'Unauthorized',
    'Unauthenticated',
    'Invalid API key',
    'invalid api key provided',
  ])('returns true for "%s"', (message) => {
    expect(isTokenExpiredMessage(message)).toBe(true);
  });

  it.each([
    'Manifest not found at /tmp/app.tar.gz',
    'Build failed: out of memory',
    'Network error: ECONNRESET',
    'Server returned 500',
  ])('returns false for unrelated errors: "%s"', (message) => {
    expect(isTokenExpiredMessage(message)).toBe(false);
  });

  it('returns false for empty / nullish input', () => {
    expect(isTokenExpiredMessage(undefined)).toBe(false);
    expect(isTokenExpiredMessage(null)).toBe(false);
    expect(isTokenExpiredMessage('')).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(isTokenExpiredMessage('TOKEN HAS EXPIRED')).toBe(true);
    expect(isTokenExpiredMessage('UNAUTHORIZED')).toBe(true);
  });
});
