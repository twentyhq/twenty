import { coerceNumericFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-numeric-field-or-throw.util';

describe('coerceNumericFieldOrThrow', () => {
  describe('valid inputs', () => {
    it('should return null when value is null', () => {
      const result = coerceNumericFieldOrThrow(null, 'testField');

      expect(result).toBeNull();
    });

    it('should return the number when value is a positive integer', () => {
      const result = coerceNumericFieldOrThrow(123, 'testField');

      expect(result).toBe(123);
    });

    it('should return the number when value is a negative integer', () => {
      const result = coerceNumericFieldOrThrow(-456, 'testField');

      expect(result).toBe(-456);
    });

    it('should return the number when value is a positive float', () => {
      const result = coerceNumericFieldOrThrow(123.45, 'testField');

      expect(result).toBe(123.45);
    });

    it('should return the number when value is zero', () => {
      const result = coerceNumericFieldOrThrow(0, 'testField');

      expect(result).toBe(0);
    });

    it('should return the number when value is a string with a number', () => {
      expect(coerceNumericFieldOrThrow('123', 'testField')).toBe(123);
    });

    it('should return null when value is an empty string', () => {
      const result = coerceNumericFieldOrThrow('', 'testField');

      expect(result).toBeNull();
    });
  });

  describe('invalid inputs', () => {
    it('should throw when value is undefined', () => {
      expect(() => coerceNumericFieldOrThrow(undefined, 'testField')).toThrow(
        'Invalid number value NaN for field "testField"',
      );
    });

    it('should throw when value is a boolean (true)', () => {
      expect(() => coerceNumericFieldOrThrow(true, 'testField')).toThrow(
        'Invalid number value NaN for field "testField"',
      );
    });

    it('should throw when value is a boolean (false)', () => {
      expect(() => coerceNumericFieldOrThrow(false, 'testField')).toThrow(
        'Invalid number value NaN for field "testField"',
      );
    });

    it('should throw when value is an array', () => {
      expect(() => coerceNumericFieldOrThrow([1, 2, 3], 'testField')).toThrow(
        'Invalid number value NaN for field "testField"',
      );
    });

    it('should throw when value is an object', () => {
      expect(() =>
        coerceNumericFieldOrThrow({ key: 'value' }, 'testField'),
      ).toThrow('Invalid number value NaN for field "testField"');
    });

    it('should throw when value is NaN', () => {
      expect(() => coerceNumericFieldOrThrow(NaN, 'testField')).toThrow(
        'Invalid number value NaN for field "testField"',
      );
    });
  });
});
