import { validateCurrencyFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-currency-field-or-throw.util';
import { CommonQueryRunnerException } from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

describe('validateCurrencyFieldOrThrow', () => {
  describe('valid inputs', () => {
    it('should return null when value is null', () => {
      const result = validateCurrencyFieldOrThrow(null, 'testField');

      expect(result).toBeNull();
    });

    it('should return the currency object when both amountMicros and currencyCode are valid', () => {
      const currencyValue = {
        amountMicros: 1000000,
        currencyCode: 'USD',
      };
      const result = validateCurrencyFieldOrThrow(currencyValue, 'testField');

      expect(result).toEqual(currencyValue);
    });

    it('should return the currency object when only amountMicros is provided', () => {
      const currencyValue = {
        amountMicros: 5000000,
      };
      const result = validateCurrencyFieldOrThrow(currencyValue, 'testField');

      expect(result).toEqual(currencyValue);
    });
  });

  describe('invalid inputs', () => {
    it('should throw when value is not an object', () => {
      expect(() =>
        validateCurrencyFieldOrThrow('not an object', 'testField'),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when amountMicros is not a valid numeric value', () => {
      const currencyValue = {
        amountMicros: 'not a number',
        currencyCode: 'USD',
      };

      expect(() =>
        validateCurrencyFieldOrThrow(currencyValue, 'testField'),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when currencyCode is not a string', () => {
      const currencyValue = {
        amountMicros: 1000000,
        currencyCode: 123,
      };

      expect(() =>
        validateCurrencyFieldOrThrow(currencyValue, 'testField'),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when an invalid subfield is present', () => {
      const currencyValue = {
        amountMicros: 1000000,
        currencyCode: 'USD',
        invalidField: 'invalid',
      };

      expect(() =>
        validateCurrencyFieldOrThrow(currencyValue, 'testField'),
      ).toThrow(CommonQueryRunnerException);
    });
  });
});
