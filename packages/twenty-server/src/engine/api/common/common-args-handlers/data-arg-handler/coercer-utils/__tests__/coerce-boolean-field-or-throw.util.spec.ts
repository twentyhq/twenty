import { coerceBooleanFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-boolean-field-or-throw.util';
import { CommonDataCoercerException } from 'src/engine/api/common/common-args-handlers/data-arg-handler/errors/common-data-coercer.exception';

describe('coerceBooleanFieldOrThrow', () => {
  describe('valid inputs', () => {
    it('should return null when value is null', () => {
      const result = coerceBooleanFieldOrThrow(null, 'testField');

      expect(result).toBeNull();
    });

    it('should return true when value is true', () => {
      const result = coerceBooleanFieldOrThrow(true, 'testField');

      expect(result).toBe(true);
    });

    it('should return false when value is false', () => {
      const result = coerceBooleanFieldOrThrow(false, 'testField');

      expect(result).toBe(false);
    });
  });

  describe('invalid inputs', () => {
    it('should throw when value is undefined', () => {
      expect(() => coerceBooleanFieldOrThrow(undefined, 'testField')).toThrow(
        CommonDataCoercerException,
      );
    });

    it('should throw when value is a string "true"', () => {
      expect(() => coerceBooleanFieldOrThrow('true', 'testField')).toThrow(
        CommonDataCoercerException,
      );
    });

    it('should throw when value is an empty string', () => {
      expect(() => coerceBooleanFieldOrThrow('', 'testField')).toThrow(
        CommonDataCoercerException,
      );
    });

    it('should throw when value is a number 1', () => {
      expect(() => coerceBooleanFieldOrThrow(1, 'testField')).toThrow(
        CommonDataCoercerException,
      );
    });

    it('should throw when value is a number 0', () => {
      expect(() => coerceBooleanFieldOrThrow(0, 'testField')).toThrow(
        CommonDataCoercerException,
      );
    });

    it('should throw when value is an object', () => {
      expect(() => coerceBooleanFieldOrThrow({}, 'testField')).toThrow(
        CommonDataCoercerException,
      );
    });

    it('should throw when value is a function', () => {
      const functionValue = () => true;

      expect(() =>
        coerceBooleanFieldOrThrow(functionValue, 'testField'),
      ).toThrow(CommonDataCoercerException);
    });
  });
});
