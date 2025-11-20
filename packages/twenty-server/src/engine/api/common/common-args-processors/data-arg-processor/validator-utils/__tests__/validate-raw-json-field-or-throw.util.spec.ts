import { validateRawJsonFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-raw-json-field-or-throw.util';
import { CommonQueryRunnerException } from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

describe('validateRawJsonFieldOrThrow', () => {
  describe('valid inputs', () => {
    it('should return null when value is null', () => {
      const result = validateRawJsonFieldOrThrow(null, 'testField');

      expect(result).toBeNull();
    });

    it('should return empty object when value is an empty object', () => {
      const result = validateRawJsonFieldOrThrow({}, 'testField');

      expect(result).toEqual({});
    });

    it('should return the value when it is a valid JSON object', () => {
      const jsonObject = { key: 'value', nested: { prop: 123 } };
      const result = validateRawJsonFieldOrThrow(jsonObject, 'testField');

      expect(result).toEqual(jsonObject);
    });

    it('should return the value when it is a valid JSON array', () => {
      const jsonArray = [1, 2, 3, 'test', { key: 'value' }];
      const result = validateRawJsonFieldOrThrow(jsonArray, 'testField');

      expect(result).toEqual(jsonArray);
    });

    it('should accept a valid JSON string', () => {
      const jsonString = '{"key":"value","nested":{"prop":123}}';
      const result = validateRawJsonFieldOrThrow(jsonString, 'testField');

      expect(result).toBe(jsonString);
    });

    it('should accept a valid JSON array string', () => {
      const jsonArrayString = '[1, 2, 3, "test"]';
      const result = validateRawJsonFieldOrThrow(jsonArrayString, 'testField');

      expect(result).toBe(jsonArrayString);
    });
  });

  describe('invalid inputs', () => {
    it('should throw when value is undefined', () => {
      expect(() => validateRawJsonFieldOrThrow(undefined, 'testField')).toThrow(
        CommonQueryRunnerException,
      );
    });

    it('should throw when value is a function', () => {
      const functionValue = () => 'test';

      expect(() =>
        validateRawJsonFieldOrThrow(functionValue, 'testField'),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when value is a number', () => {
      expect(() => validateRawJsonFieldOrThrow(42, 'testField')).toThrow(
        CommonQueryRunnerException,
      );
    });

    it('should throw when value is an invalid JSON string', () => {
      expect(() =>
        validateRawJsonFieldOrThrow('not valid json', 'testField'),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when value is a boolean', () => {
      expect(() => validateRawJsonFieldOrThrow(true, 'testField')).toThrow(
        CommonQueryRunnerException,
      );
    });
  });
});
