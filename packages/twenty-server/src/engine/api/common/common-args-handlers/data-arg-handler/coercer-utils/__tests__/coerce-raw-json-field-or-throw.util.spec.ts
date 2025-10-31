import { coerceRawJsonFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-raw-json-field-or-throw.util';
import { CommonDataCoercerException } from 'src/engine/api/common/common-args-handlers/data-arg-handler/common-data-coercer.exception';

describe('coerceRawJsonFieldOrThrow', () => {
  describe('valid inputs', () => {
    it('should return null when value is null', () => {
      const result = coerceRawJsonFieldOrThrow(null, 'testField');

      expect(result).toBeNull();
    });

    it('should return null when value is an empty object', () => {
      const result = coerceRawJsonFieldOrThrow({}, 'testField');

      expect(result).toBeNull();
    });

    it('should return the value when it is a valid JSON object', () => {
      const jsonObject = { key: 'value', nested: { prop: 123 } };
      const result = coerceRawJsonFieldOrThrow(jsonObject, 'testField');

      expect(result).toEqual(jsonObject);
    });

    it('should return the value when it is a valid JSON array', () => {
      const jsonArray = [1, 2, 3, 'test', { key: 'value' }];
      const result = coerceRawJsonFieldOrThrow(jsonArray, 'testField');

      expect(result).toEqual(jsonArray);
    });
  });

  describe('invalid inputs', () => {
    it('should throw when value is undefined', () => {
      expect(() => coerceRawJsonFieldOrThrow(undefined, 'testField')).toThrow(
        CommonDataCoercerException,
      );
    });

    it('should throw when value is a function', () => {
      const functionValue = () => 'test';

      expect(() =>
        coerceRawJsonFieldOrThrow(functionValue, 'testField'),
      ).toThrow(CommonDataCoercerException);
    });

    it('should throw when value is a number', () => {
      expect(() => coerceRawJsonFieldOrThrow(42, 'testField')).toThrow(
        CommonDataCoercerException,
      );
    });

    it('should throw when value is a string', () => {
      expect(() =>
        coerceRawJsonFieldOrThrow('string value', 'testField'),
      ).toThrow(CommonDataCoercerException);
    });
  });
});
