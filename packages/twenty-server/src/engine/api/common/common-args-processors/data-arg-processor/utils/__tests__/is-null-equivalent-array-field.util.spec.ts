import { isNullEquivalentArrayFieldValue } from 'src/engine/api/common/common-args-processors/data-arg-processor/utils/is-null-equivalent-array-field-value.util';

describe('isNullEquivalentArrayFieldValue', () => {
  describe('null-equivalent values', () => {
    it('should return true when value is null', () => {
      const result = isNullEquivalentArrayFieldValue(null);

      expect(result).toBe(true);
    });

    it('should return true when value is an empty array', () => {
      const result = isNullEquivalentArrayFieldValue([]);

      expect(result).toBe(true);
    });

    it('should return true when value is an empty object', () => {
      const result = isNullEquivalentArrayFieldValue({});

      expect(result).toBe(true);
    });

    it('should return true when value is an array containing only empty objects', () => {
      const result = isNullEquivalentArrayFieldValue([{}]);

      expect(result).toBe(true);
    });

    it('should return true when value is an array containing only null-equivalent entries', () => {
      const result = isNullEquivalentArrayFieldValue([{}, null, []]);

      expect(result).toBe(true);
    });
  });

  describe('non-null-equivalent values', () => {
    it('should return false when value is undefined', () => {
      const result = isNullEquivalentArrayFieldValue(undefined);

      expect(result).toBe(false);
    });
    it('should return false when value is an array with one item', () => {
      const result = isNullEquivalentArrayFieldValue(['item']);

      expect(result).toBe(false);
    });

    it('should return false when value is a string', () => {
      const result = isNullEquivalentArrayFieldValue('hello');

      expect(result).toBe(false);
    });

    it('should return false when value is an empty string', () => {
      const result = isNullEquivalentArrayFieldValue('');

      expect(result).toBe(false);
    });

    it('should return false when value is a non-empty object', () => {
      const result = isNullEquivalentArrayFieldValue({ foo: 'bar' });

      expect(result).toBe(false);
    });

    it('should return false when value is an array containing a non-empty object', () => {
      const result = isNullEquivalentArrayFieldValue([{ number: '123' }]);

      expect(result).toBe(false);
    });
  });
});
