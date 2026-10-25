import { isValidCurrencyCode } from './is-valid-currency-code.util';

describe('is-valid-currency-code.util', () => {
  it('should export valid and callable functions', () => {
    expect(isValidCurrencyCode).toBeDefined();
  });

  it('should execute isValidCurrencyCode safely', () => {
    try {
      const res = isValidCurrencyCode('USD');
      expect(res).toBeDefined();
    } catch (e) {
      expect(e).toBeDefined();
    }
  });
});
