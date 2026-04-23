import { validateNumberFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-number-field-or-throw.util';

describe('validateNumberFieldOrThrow', () => {
  describe('valid inputs', () => {
    it('should return null when value is null', () => {
      const result = validateNumberFieldOrThrow(null, 'testField');

      expect(result).toBeNull();
    });

    it('should return the number when value is a positive integer', () => {
      const result = validateNumberFieldOrThrow(123, 'testField');

      expect(result).toBe(123);
    });

    it('should return the number when value is a negative integer', () => {
      const result = validateNumberFieldOrThrow(-456, 'testField');

      expect(result).toBe(-456);
    });

    it('should return the number when value is a positive float', () => {
      const result = validateNumberFieldOrThrow(123.45, 'testField');

      expect(result).toBe(123.45);
    });

    it('should return the number when value is zero', () => {
      const result = validateNumberFieldOrThrow(0, 'testField');

      expect(result).toBe(0);
    });
  });

  describe('invalid inputs', () => {
    it('should throw when value is undefined', () => {
      expect(() => validateNumberFieldOrThrow(undefined, 'testField')).toThrow(
        'Invalid number value undefined for field "testField"',
      );
    });

    it('should throw when value is a string with a number', () => {
      expect(() => validateNumberFieldOrThrow('123', 'testField')).toThrow(
        'Invalid number value \'123\' for field "testField"',
      );
    });

    it('should throw when value is an empty string', () => {
      expect(() => validateNumberFieldOrThrow('', 'testField')).toThrow(
        'Invalid number value \'\' for field "testField"',
      );
    });

    it('should throw when value is a boolean (true)', () => {
      expect(() => validateNumberFieldOrThrow(true, 'testField')).toThrow(
        'Invalid number value true for field "testField"',
      );
    });

    it('should throw when value is a boolean (false)', () => {
      expect(() => validateNumberFieldOrThrow(false, 'testField')).toThrow(
        'Invalid number value false for field "testField"',
      );
    });

    it('should throw when value is an array', () => {
      expect(() => validateNumberFieldOrThrow([1, 2, 3], 'testField')).toThrow(
        'Invalid number value [ 1, 2, 3 ] for field "testField"',
      );
    });

    it('should throw when value is an object', () => {
      expect(() =>
        validateNumberFieldOrThrow({ key: 'value' }, 'testField'),
      ).toThrow(
        'Invalid number value { key: \'value\' } for field "testField"',
      );
    });

    it('should throw when value is NaN', () => {
      expect(() => validateNumberFieldOrThrow(NaN, 'testField')).toThrow(
        'Invalid number value NaN for field "testField"',
      );
    });
  });
});
