import { isJwkThumbprint } from 'src/engine/core-modules/jwt/utils/is-jwk-thumbprint.util';

describe('isJwkThumbprint', () => {
  it('accepts a typical 43-char base64url SHA-256 thumbprint', () => {
    const value = 'A'.repeat(43);

    expect(isJwkThumbprint(value)).toBe(true);
  });

  it('accepts base64url alphabet characters (A-Z, a-z, 0-9, _, -)', () => {
    expect(isJwkThumbprint('abcXYZ-_0123456789')).toBe(true);
  });

  it('rejects non-string values', () => {
    expect(isJwkThumbprint(undefined)).toBe(false);
    expect(isJwkThumbprint(null)).toBe(false);
    expect(isJwkThumbprint(42)).toBe(false);
    expect(isJwkThumbprint({})).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isJwkThumbprint('')).toBe(false);
  });

  it('rejects strings longer than 128 chars', () => {
    expect(isJwkThumbprint('A'.repeat(129))).toBe(false);
  });

  it('rejects strings with invalid characters', () => {
    expect(isJwkThumbprint('has space')).toBe(false);
    expect(isJwkThumbprint('has/slash')).toBe(false);
    expect(isJwkThumbprint('has+plus')).toBe(false);
    expect(isJwkThumbprint('has=padding')).toBe(false);
    expect(isJwkThumbprint('has:colon')).toBe(false);
  });
});
