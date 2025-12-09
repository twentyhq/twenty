import { validateTextFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-text-field-or-throw.util';

describe('validateTextFieldOrThrow', () => {
  describe('valid inputs', () => {
    it('should return null when value is null', () => {
      const result = validateTextFieldOrThrow(null, 'testField');

      expect(result).toBeNull();
    });

    it('should return empty string when value is an empty string', () => {
      const result = validateTextFieldOrThrow('', 'testField');

      expect(result).toEqual('');
    });

    it('should return the string when value is a regular string', () => {
      const result = validateTextFieldOrThrow('hello world', 'testField');

      expect(result).toBe('hello world');
    });
  });

  describe('invalid inputs', () => {
    it('should throw when value is undefined', () => {
      expect(() => validateTextFieldOrThrow(undefined, 'testField')).toThrow(
        'Invalid string value undefined for text field "testField"',
      );
    });

    it('should throw when value is a number', () => {
      expect(() => validateTextFieldOrThrow(123, 'testField')).toThrow(
        'Invalid string value 123 for text field "testField"',
      );
    });

    it('should throw when value is a float number', () => {
      expect(() => validateTextFieldOrThrow(123.45, 'testField')).toThrow(
        'Invalid string value 123.45 for text field "testField"',
      );
    });

    it('should throw when value is a boolean (true)', () => {
      expect(() => validateTextFieldOrThrow(true, 'testField')).toThrow(
        'Invalid string value true for text field "testField"',
      );
    });

    it('should throw when value is a boolean (false)', () => {
      expect(() => validateTextFieldOrThrow(false, 'testField')).toThrow(
        'Invalid string value false for text field "testField"',
      );
    });

    it('should throw when value is an array', () => {
      expect(() => validateTextFieldOrThrow([1, 2, 3], 'testField')).toThrow(
        'Invalid string value [ 1, 2, 3 ] for text field "testField"',
      );
    });

    it('should throw when value is an object', () => {
      expect(() =>
        validateTextFieldOrThrow({ key: 'value' }, 'testField'),
      ).toThrow(
        'Invalid string value { key: \'value\' } for text field "testField"',
      );
    });
  });
});
