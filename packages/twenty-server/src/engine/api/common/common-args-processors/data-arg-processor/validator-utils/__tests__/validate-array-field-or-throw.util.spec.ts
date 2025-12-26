import { validateArrayFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-array-field-or-throw.util';
import { CommonQueryRunnerException } from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

describe('validateArrayFieldOrThrow', () => {
  describe('valid inputs', () => {
    it('should return null when value is null', () => {
      const result = validateArrayFieldOrThrow(null, 'testField');

      expect(result).toBeNull();
    });

    it('should return the string when value is a string', () => {
      const result = validateArrayFieldOrThrow('singleString', 'testField');

      expect(result).toBe('singleString');
    });

    it('should return the array when value is an empty array', () => {
      const result = validateArrayFieldOrThrow([], 'testField');

      expect(result).toEqual([]);
    });

    it('should return the array when value is an array of strings', () => {
      const stringArray = ['string1', 'string2', 'string3'];
      const result = validateArrayFieldOrThrow(stringArray, 'testField');

      expect(result).toEqual(stringArray);
    });
  });

  describe('invalid inputs', () => {
    it('should throw when value is a number', () => {
      expect(() => validateArrayFieldOrThrow(123, 'testField')).toThrow(
        CommonQueryRunnerException,
      );
    });

    it('should throw when value is an object', () => {
      const objectValue = { key: 'value' };

      expect(() => validateArrayFieldOrThrow(objectValue, 'testField')).toThrow(
        CommonQueryRunnerException,
      );
    });

    it('should throw when value is an array containing objects', () => {
      const arrayWithObjects = ['string1', { key: 'value' }, 'string2'];

      expect(() =>
        validateArrayFieldOrThrow(arrayWithObjects, 'testField'),
      ).toThrow(CommonQueryRunnerException);
    });
  });
});
