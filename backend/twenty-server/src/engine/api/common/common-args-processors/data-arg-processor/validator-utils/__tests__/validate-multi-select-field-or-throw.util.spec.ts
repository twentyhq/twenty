import { validateMultiSelectFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-multi-select-field-or-throw.util';
import { CommonQueryRunnerException } from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

describe('validateMultiSelectFieldOrThrow', () => {
  const validOptions = ['option1', 'option2', 'option3'];

  describe('valid inputs', () => {
    it('should return null when value is null', () => {
      const result = validateMultiSelectFieldOrThrow(
        null,
        'testField',
        validOptions,
      );

      expect(result).toBeNull();
    });

    it('should return array when all values are in options', () => {
      const value = ['option1', 'option2'];
      const result = validateMultiSelectFieldOrThrow(
        value,
        'testField',
        validOptions,
      );

      expect(result).toEqual(value);
    });

    it('should return string when value is a single string in options', () => {
      const value = 'option1';
      const result = validateMultiSelectFieldOrThrow(
        value,
        'testField',
        validOptions,
      );

      expect(result).toEqual(value);
    });

    it('should return empty array when value is empty array', () => {
      const value: string[] = [];
      const result = validateMultiSelectFieldOrThrow(
        value,
        'testField',
        validOptions,
      );

      expect(result).toEqual(value);
    });
  });

  describe('invalid inputs', () => {
    it('should throw when options are undefined', () => {
      expect(() =>
        validateMultiSelectFieldOrThrow(['option1'], 'testField', undefined),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when options are not defined', () => {
      expect(() =>
        validateMultiSelectFieldOrThrow(['option1'], 'testField'),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when value contains option not in the options list', () => {
      const value = ['option1', 'invalidOption'];

      expect(() =>
        validateMultiSelectFieldOrThrow(value, 'testField', validOptions),
      ).toThrow(CommonQueryRunnerException);
    });
  });
});
