import { validateNumericFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-numeric-field-or-throw.util';
import { CommonQueryRunnerException } from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

describe('validateNumericFieldOrThrow', () => {
  describe('valid inputs', () => {
    it('should return null when value is null', () => {
      const result = validateNumericFieldOrThrow(null, 'testField');

      expect(result).toBeNull();
    });

    it('should return null when value is an empty string', () => {
      const result = validateNumericFieldOrThrow('', 'testField');

      expect(result).toBeNull();
    });

    it('should return the number when value is a float', () => {
      const result = validateNumericFieldOrThrow(3.14159, 'testField');

      expect(result).toBe(3.14159);
    });
  });
  describe('invalid inputs', () => {
    it('should throw when value is NaN', () => {
      expect(() => validateNumericFieldOrThrow(NaN, 'testField')).toThrow(
        CommonQueryRunnerException,
      );
    });

    it('should throw when value is a non-numeric string', () => {
      expect(() =>
        validateNumericFieldOrThrow('not a number', 'testField'),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when value is undefined', () => {
      expect(() => validateNumericFieldOrThrow(undefined, 'testField')).toThrow(
        CommonQueryRunnerException,
      );
    });

    it('should throw when value is an array', () => {
      expect(() => validateNumericFieldOrThrow([1, 2, 3], 'testField')).toThrow(
        CommonQueryRunnerException,
      );
    });
  });
});
