import { coerceTextFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-text-field-or-throw.util';

describe('coerceTextFieldOrThrow', () => {
  describe('valid inputs', () => {
    it('should return null when value is null', () => {
      const result = coerceTextFieldOrThrow(null, 'testField');

      expect(result).toBeNull();
    });

    it('should return null when value is an empty string', () => {
      const result = coerceTextFieldOrThrow('', 'testField');

      expect(result).toBeNull();
    });

    it('should return the string when value is a regular string', () => {
      const result = coerceTextFieldOrThrow('hello world', 'testField');

      expect(result).toBe('hello world');
    });
  });

  describe('invalid inputs', () => {
    it('should throw when value is undefined', () => {
      expect(() => coerceTextFieldOrThrow(undefined, 'testField')).toThrow(
        'Invalid string value undefined for text field "testField"',
      );
    });

    it('should throw when value is a number', () => {
      expect(() => coerceTextFieldOrThrow(123, 'testField')).toThrow(
        'Invalid string value 123 for text field "testField"',
      );
    });

    it('should throw when value is a float number', () => {
      expect(() => coerceTextFieldOrThrow(123.45, 'testField')).toThrow(
        'Invalid string value 123.45 for text field "testField"',
      );
    });

    it('should throw when value is a boolean (true)', () => {
      expect(() => coerceTextFieldOrThrow(true, 'testField')).toThrow(
        'Invalid string value true for text field "testField"',
      );
    });

    it('should throw when value is a boolean (false)', () => {
      expect(() => coerceTextFieldOrThrow(false, 'testField')).toThrow(
        'Invalid string value false for text field "testField"',
      );
    });

    it('should throw when value is an array', () => {
      expect(() => coerceTextFieldOrThrow([1, 2, 3], 'testField')).toThrow(
        'Invalid string value [ 1, 2, 3 ] for text field "testField"',
      );
    });

    it('should throw when value is an object', () => {
      expect(() =>
        coerceTextFieldOrThrow({ key: 'value' }, 'testField'),
      ).toThrow(
        'Invalid string value { key: \'value\' } for text field "testField"',
      );
    });
  });
});
