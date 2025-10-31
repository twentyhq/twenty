import { coerceArrayFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-array-field-or-throw.util';
import { CommonDataCoercerException } from 'src/engine/api/common/common-args-handlers/data-arg-handler/errors/common-data-coercer.exception';

describe('coerceArrayFieldOrThrow', () => {
  describe('valid inputs', () => {
    it('should return null when value is null', () => {
      const result = coerceArrayFieldOrThrow(null, 'testField');

      expect(result).toBeNull();
    });

    it('should return null when value is an empty array', () => {
      const result = coerceArrayFieldOrThrow([], 'testField');

      expect(result).toBeNull();
    });

    it('should return the value when it is a valid array with strings', () => {
      const arrayValue = ['item1', 'item2', 'item3'];
      const result = coerceArrayFieldOrThrow(arrayValue, 'testField');

      expect(result).toEqual(arrayValue);
    });
  });

  describe('invalid inputs', () => {
    it('should throw when value is undefined', () => {
      expect(() => coerceArrayFieldOrThrow(undefined, 'testField')).toThrow(
        CommonDataCoercerException,
      );
    });

    it('should throw when value is a string', () => {
      expect(() =>
        coerceArrayFieldOrThrow('not an array', 'testField'),
      ).toThrow(CommonDataCoercerException);
    });

    it('should throw when value is a number', () => {
      expect(() => coerceArrayFieldOrThrow(42, 'testField')).toThrow(
        CommonDataCoercerException,
      );
    });

    it('should throw when value is a boolean', () => {
      expect(() => coerceArrayFieldOrThrow(true, 'testField')).toThrow(
        CommonDataCoercerException,
      );
    });

    it('should throw when value is a plain object', () => {
      expect(() =>
        coerceArrayFieldOrThrow({ key: 'value' }, 'testField'),
      ).toThrow(CommonDataCoercerException);
    });

    it('should throw when value is a function', () => {
      const functionValue = () => 'test';

      expect(() => coerceArrayFieldOrThrow(functionValue, 'testField')).toThrow(
        CommonDataCoercerException,
      );
    });

    it('should throw when value is an array of objects', () => {
      expect(() =>
        coerceArrayFieldOrThrow([{ key: 'value' }], 'testField'),
      ).toThrow(CommonDataCoercerException);
    });
  });
});
