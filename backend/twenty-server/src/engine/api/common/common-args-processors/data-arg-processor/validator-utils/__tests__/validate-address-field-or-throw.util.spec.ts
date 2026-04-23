import { validateAddressFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-address-field-or-throw.util';
import { CommonQueryRunnerException } from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

describe('validateAddressFieldOrThrow', () => {
  describe('valid inputs', () => {
    it('should return null when value is null', () => {
      const result = validateAddressFieldOrThrow(null, 'testField');

      expect(result).toBeNull();
    });

    it('should return valid address object with all text fields', () => {
      const value = {
        addressStreet1: '123 Main St',
        addressStreet2: 'Apt 4B',
        addressCity: 'New York',
        addressState: 'NY',
        addressPostcode: '10001',
        addressCountry: 'USA',
      };
      const result = validateAddressFieldOrThrow(value, 'testField');

      expect(result).toEqual(value);
    });

    it('should return valid address object with coordinates', () => {
      const value = {
        addressStreet1: '123 Main St',
        addressCity: 'New York',
        addressLat: 40.7128,
        addressLng: -74.006,
      };
      const result = validateAddressFieldOrThrow(value, 'testField');

      expect(result).toEqual(value);
    });

    it('should return valid address object with null subfields', () => {
      const value = {
        addressStreet1: '123 Main St',
        addressStreet2: null,
        addressCity: 'New York',
        addressState: null,
        addressPostcode: null,
        addressCountry: null,
        addressLat: null,
        addressLng: null,
      };
      const result = validateAddressFieldOrThrow(value, 'testField');

      expect(result).toEqual(value);
    });
  });

  describe('invalid inputs', () => {
    it('should throw when value is not an object', () => {
      expect(() => validateAddressFieldOrThrow('invalid', 'testField')).toThrow(
        CommonQueryRunnerException,
      );
    });

    it('should throw when value is an array', () => {
      expect(() =>
        validateAddressFieldOrThrow(['123 Main St'], 'testField'),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when addressStreet1 is not a string or number', () => {
      const value = {
        addressStreet1: { invalid: 'object' },
      };

      expect(() => validateAddressFieldOrThrow(value, 'testField')).toThrow(
        CommonQueryRunnerException,
      );
    });

    it('should throw when addressStreet2 is not a string', () => {
      const value = {
        addressStreet2: 123,
      };

      expect(() => validateAddressFieldOrThrow(value, 'testField')).toThrow(
        CommonQueryRunnerException,
      );
    });

    it('should throw when addressCity is not a string', () => {
      const value = {
        addressCity: true,
      };

      expect(() => validateAddressFieldOrThrow(value, 'testField')).toThrow(
        CommonQueryRunnerException,
      );
    });

    it('should throw when addressState is not a string', () => {
      const value = {
        addressState: ['NY'],
      };

      expect(() => validateAddressFieldOrThrow(value, 'testField')).toThrow(
        CommonQueryRunnerException,
      );
    });

    it('should throw when addressPostcode is not a string', () => {
      const value = {
        addressPostcode: 10001,
      };

      expect(() => validateAddressFieldOrThrow(value, 'testField')).toThrow(
        CommonQueryRunnerException,
      );
    });

    it('should throw when addressCountry is not a string', () => {
      const value = {
        addressCountry: { code: 'US' },
      };

      expect(() => validateAddressFieldOrThrow(value, 'testField')).toThrow(
        CommonQueryRunnerException,
      );
    });

    it('should throw when addressLat is not a number', () => {
      const value = {
        addressLat: 'not a number',
      };

      expect(() => validateAddressFieldOrThrow(value, 'testField')).toThrow(
        CommonQueryRunnerException,
      );
    });

    it('should throw when addressLng is not a number', () => {
      const value = {
        addressLng: 'not a number',
      };

      expect(() => validateAddressFieldOrThrow(value, 'testField')).toThrow(
        CommonQueryRunnerException,
      );
    });

    it('should throw when an invalid subfield is provided', () => {
      const value = {
        addressStreet1: '123 Main St',
        invalidSubField: 'invalid',
      };

      expect(() => validateAddressFieldOrThrow(value, 'testField')).toThrow(
        CommonQueryRunnerException,
      );
    });
  });
});
