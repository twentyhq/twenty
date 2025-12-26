import { validateFullNameFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-full-name-field-or-throw.util';
import { CommonQueryRunnerException } from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

describe('validateFullNameFieldOrThrow', () => {
  describe('valid inputs', () => {
    it('should return null when value is null', () => {
      const result = validateFullNameFieldOrThrow(null, 'testField');

      expect(result).toBeNull();
    });

    it('should return valid full name object with both fields', () => {
      const value = {
        firstName: 'John',
        lastName: 'Doe',
      };
      const result = validateFullNameFieldOrThrow(value, 'testField');

      expect(result).toEqual(value);
    });

    it('should return valid full name object with only firstName', () => {
      const value = {
        firstName: 'John',
      };
      const result = validateFullNameFieldOrThrow(value, 'testField');

      expect(result).toEqual(value);
    });

    it('should return valid full name object with only lastName', () => {
      const value = {
        lastName: 'Doe',
      };
      const result = validateFullNameFieldOrThrow(value, 'testField');

      expect(result).toEqual(value);
    });
  });

  describe('invalid inputs', () => {
    it('should throw when value is not an object', () => {
      expect(() =>
        validateFullNameFieldOrThrow('invalid', 'testField'),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when firstName is not a string', () => {
      const value = {
        firstName: { invalid: 'object' },
      };

      expect(() => validateFullNameFieldOrThrow(value, 'testField')).toThrow(
        CommonQueryRunnerException,
      );
    });

    it('should throw when an invalid subfield is provided', () => {
      const value = {
        firstName: 'John',
        lastName: 'Doe',
        invalidSubField: 'invalid',
      };

      expect(() => validateFullNameFieldOrThrow(value, 'testField')).toThrow(
        CommonQueryRunnerException,
      );
    });
  });
});
