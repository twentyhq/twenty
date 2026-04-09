import { isNullEquivalentRawJsonFieldValue } from 'src/engine/api/common/common-args-processors/data-arg-processor/utils/is-null-equivalent-raw-json-field-value.util';

describe('isNullEquivalentRawJsonFieldValue', () => {
  describe('null-equivalent values', () => {
    it('should return true when value is null', () => {
      const result = isNullEquivalentRawJsonFieldValue(null);

      expect(result).toBe(true);
    });

    it('should return true when value is an empty object', () => {
      const result = isNullEquivalentRawJsonFieldValue({});

      expect(result).toBe(true);
    });

    it('should return true when value is an empty array', () => {
      const result = isNullEquivalentRawJsonFieldValue([]);

      expect(result).toBe(true);
    });
  });

  describe('non-null-equivalent values', () => {
    it('should return false when value is undefined', () => {
      const result = isNullEquivalentRawJsonFieldValue(undefined);

      expect(result).toBe(false);
    });
    it('should return false when value is an object with properties', () => {
      const result = isNullEquivalentRawJsonFieldValue({ key: 'value' });

      expect(result).toBe(false);
    });

    it('should return false when value is a string', () => {
      const result = isNullEquivalentRawJsonFieldValue('hello');

      expect(result).toBe(false);
    });

    it('should return false when value is an empty string', () => {
      const result = isNullEquivalentRawJsonFieldValue('');

      expect(result).toBe(false);
    });
  });
});
