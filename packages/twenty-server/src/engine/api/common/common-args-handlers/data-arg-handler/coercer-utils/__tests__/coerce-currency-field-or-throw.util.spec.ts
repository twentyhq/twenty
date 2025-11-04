import { coerceCurrencyFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-currency-field-or-throw.util';

describe('coerceCurrencyFieldOrThrow', () => {
  describe('valid inputs', () => {
    it('should return null when value is null', () => {
      const result = coerceCurrencyFieldOrThrow(null, 'testField');

      expect(result).toBeNull();
    });

    it('should return null when value is an empty object', () => {
      const result = coerceCurrencyFieldOrThrow({}, 'testField');

      expect(result).toBeNull();
    });

    it('should return the currency when value has both amountMicros and currencyCode', () => {
      const currency = {
        amountMicros: 1500000,
        currencyCode: 'EUR',
      };
      const result = coerceCurrencyFieldOrThrow(currency, 'testField');

      expect(result).toEqual(currency);
    });
  });

  describe('invalid inputs', () => {
    it('should throw when value is undefined', () => {
      expect(() => coerceCurrencyFieldOrThrow(undefined, 'testField')).toThrow(
        'Invalid value undefined for currency field "testField"',
      );
    });

    it('should throw when value is a string', () => {
      expect(() => coerceCurrencyFieldOrThrow('1000', 'testField')).toThrow(
        'Invalid value \'1000\' for currency field "testField"',
      );
    });

    it('should throw when value is an array', () => {
      expect(() =>
        coerceCurrencyFieldOrThrow([1000, 'USD'], 'testField'),
      ).toThrow(
        'Invalid value [ 1000, \'USD\' ] for currency field "testField"',
      );
    });

    it('should throw when value contains an invalid subfield name', () => {
      const currency = {
        amountMicros: 1000000,
        currencyCode: 'USD',
        invalidField: 'invalid',
      };

      expect(() => coerceCurrencyFieldOrThrow(currency, 'testField')).toThrow(
        'Invalid value',
      );
      expect(() => coerceCurrencyFieldOrThrow(currency, 'testField')).toThrow(
        'Invalid subfield invalidField',
      );
    });
  });
});
