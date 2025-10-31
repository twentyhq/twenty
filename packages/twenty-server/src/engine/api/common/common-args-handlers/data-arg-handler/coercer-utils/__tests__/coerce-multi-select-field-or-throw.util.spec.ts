import { coerceMultiSelectFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-multi-select-field-or-throw.util';
import { CommonDataCoercerException } from 'src/engine/api/common/common-args-handlers/data-arg-handler/common-data-coercer.exception';

describe('coerceMultiSelectFieldOrThrow', () => {
  const validOptions = ['option1', 'option2', 'option3'];

  describe('valid inputs', () => {
    it('should return null when value is null', () => {
      const result = coerceMultiSelectFieldOrThrow(
        null,
        validOptions,
        'testField',
      );

      expect(result).toBeNull();
    });

    it('should return null when value is an empty array', () => {
      const result = coerceMultiSelectFieldOrThrow(
        [],
        validOptions,
        'testField',
      );

      expect(result).toBeNull();
    });

    it('should return the value when it contains one valid option', () => {
      const arrayValue = ['option1'];
      const result = coerceMultiSelectFieldOrThrow(
        arrayValue,
        validOptions,
        'testField',
      );

      expect(result).toEqual(arrayValue);
    });

    it('should return the value when it contains many valid options', () => {
      const arrayValue = ['option1', 'option2'];
      const result = coerceMultiSelectFieldOrThrow(
        arrayValue,
        validOptions,
        'testField',
      );

      expect(result).toEqual(arrayValue);
    });
  });

  describe('invalid inputs', () => {
    it('should throw when value is undefined', () => {
      expect(() =>
        coerceMultiSelectFieldOrThrow(undefined, validOptions, 'testField'),
      ).toThrow(CommonDataCoercerException);
    });

    it('should throw when value is a string', () => {
      expect(() =>
        coerceMultiSelectFieldOrThrow('option1', validOptions, 'testField'),
      ).toThrow(CommonDataCoercerException);
    });

    it('should throw when value is a number', () => {
      expect(() =>
        coerceMultiSelectFieldOrThrow(42, validOptions, 'testField'),
      ).toThrow(CommonDataCoercerException);
    });

    it('should throw when value is a boolean', () => {
      expect(() =>
        coerceMultiSelectFieldOrThrow(true, validOptions, 'testField'),
      ).toThrow(CommonDataCoercerException);
    });

    it('should throw when value is an object', () => {
      expect(() =>
        coerceMultiSelectFieldOrThrow({}, validOptions, 'testField'),
      ).toThrow(CommonDataCoercerException);
    });

    it('should throw when all items are not valid options', () => {
      expect(() =>
        coerceMultiSelectFieldOrThrow(
          ['option', 'option2'],
          validOptions,
          'testField',
        ),
      ).toThrow(CommonDataCoercerException);
    });

    it('should throw when items are objects', () => {
      expect(() =>
        coerceMultiSelectFieldOrThrow(
          [{ key: 'value' }, { key: 'value2' }],
          validOptions,
          'testField',
        ),
      ).toThrow(CommonDataCoercerException);
    });
  });
});
