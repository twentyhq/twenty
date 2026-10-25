import { isValidCurrencyCode } from './is-valid-currency-code.util';

describe('isValidCurrencyCode', () => {
  it('should return true for valid currency codes', () => {
    expect(isValidCurrencyCode('USD')).toBe(true);
    expect(isValidCurrencyCode('EUR')).toBe(true);
  });

  it('should return false for invalid currency codes', () => {
    expect(isValidCurrencyCode('INVALID')).toBe(false);
    expect(isValidCurrencyCode('123')).toBe(false);
    expect(isValidCurrencyCode('')).toBe(false);
  });
});
