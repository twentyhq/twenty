import { coerceNumberFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-number-field-or-throw.util';

describe('coerceNumberFieldOrThrow', () => {
  describe('valid inputs', () => {
    it('should return null when value is null', () => {
      const result = coerceNumberFieldOrThrow(null, 'testField');

      expect(result).toBeNull();
    });

    it('should return the number when value is a positive integer', () => {
      const result = coerceNumberFieldOrThrow(123, 'testField');

      expect(result).toBe(123);
    });

    it('should return the number when value is a negative integer', () => {
      const result = coerceNumberFieldOrThrow(-456, 'testField');

      expect(result).toBe(-456);
    });

    it('should return the number when value is a positive float', () => {
      const result = coerceNumberFieldOrThrow(123.45, 'testField');

      expect(result).toBe(123.45);
    });

    it('should return the number when value is zero', () => {
      const result = coerceNumberFieldOrThrow(0, 'testField');

      expect(result).toBe(0);
    });
  });

  describe('invalid inputs', () => {
    it('should throw when value is undefined', () => {
      expect(() => coerceNumberFieldOrThrow(undefined, 'testField')).toThrow(
        'Invalid number value undefined for field "testField"',
      );
    });

    it('should throw when value is a string with a number', () => {
      expect(() => coerceNumberFieldOrThrow('123', 'testField')).toThrow(
        'Invalid number value \'123\' for field "testField"',
      );
    });

    it('should throw when value is an empty string', () => {
      expect(() => coerceNumberFieldOrThrow('', 'testField')).toThrow(
        'Invalid number value \'\' for field "testField"',
      );
    });

    it('should throw when value is a boolean (true)', () => {
      expect(() => coerceNumberFieldOrThrow(true, 'testField')).toThrow(
        'Invalid number value true for field "testField"',
      );
    });

    it('should throw when value is a boolean (false)', () => {
      expect(() => coerceNumberFieldOrThrow(false, 'testField')).toThrow(
        'Invalid number value false for field "testField"',
      );
    });

    it('should throw when value is an array', () => {
      expect(() => coerceNumberFieldOrThrow([1, 2, 3], 'testField')).toThrow(
        'Invalid number value [ 1, 2, 3 ] for field "testField"',
      );
    });

    it('should throw when value is an object', () => {
      expect(() =>
        coerceNumberFieldOrThrow({ key: 'value' }, 'testField'),
      ).toThrow(
        'Invalid number value { key: \'value\' } for field "testField"',
      );
    });

    it('should throw when value is NaN', () => {
      expect(() => coerceNumberFieldOrThrow(NaN, 'testField')).toThrow(
        'Invalid number value NaN for field "testField"',
      );
    });
  });
});
