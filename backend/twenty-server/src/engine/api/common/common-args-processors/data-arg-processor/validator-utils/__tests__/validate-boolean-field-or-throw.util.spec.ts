import { validateBooleanFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-boolean-field-or-throw.util';
import { CommonQueryRunnerException } from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

describe('validateBooleanFieldOrThrow', () => {
  describe('valid inputs', () => {
    it('should return null when value is null', () => {
      const result = validateBooleanFieldOrThrow(null, 'testField');

      expect(result).toBeNull();
    });

    it('should return true when value is true', () => {
      const result = validateBooleanFieldOrThrow(true, 'testField');

      expect(result).toBe(true);
    });

    it('should return false when value is false', () => {
      const result = validateBooleanFieldOrThrow(false, 'testField');

      expect(result).toBe(false);
    });
  });

  describe('invalid inputs', () => {
    it('should throw when value is undefined', () => {
      expect(() => validateBooleanFieldOrThrow(undefined, 'testField')).toThrow(
        CommonQueryRunnerException,
      );
    });

    it('should throw when value is a string "true"', () => {
      expect(() => validateBooleanFieldOrThrow('true', 'testField')).toThrow(
        CommonQueryRunnerException,
      );
    });

    it('should throw when value is an empty string', () => {
      expect(() => validateBooleanFieldOrThrow('', 'testField')).toThrow(
        CommonQueryRunnerException,
      );
    });

    it('should throw when value is a number 1', () => {
      expect(() => validateBooleanFieldOrThrow(1, 'testField')).toThrow(
        CommonQueryRunnerException,
      );
    });

    it('should throw when value is a number 0', () => {
      expect(() => validateBooleanFieldOrThrow(0, 'testField')).toThrow(
        CommonQueryRunnerException,
      );
    });

    it('should throw when value is an object', () => {
      expect(() => validateBooleanFieldOrThrow({}, 'testField')).toThrow(
        CommonQueryRunnerException,
      );
    });

    it('should throw when value is a function', () => {
      const functionValue = () => true;

      expect(() =>
        validateBooleanFieldOrThrow(functionValue, 'testField'),
      ).toThrow(CommonQueryRunnerException);
    });
  });
});
