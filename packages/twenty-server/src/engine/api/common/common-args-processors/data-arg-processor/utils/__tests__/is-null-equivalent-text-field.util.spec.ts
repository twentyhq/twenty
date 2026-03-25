import { isNullEquivalentTextFieldValue } from 'src/engine/api/common/common-args-processors/data-arg-processor/utils/is-null-equivalent-text-field-value.util';

describe('isNullEquivalentTextFieldValue', () => {
  describe('null-equivalent values', () => {
    it('should return true when value is an empty string', () => {
      const result = isNullEquivalentTextFieldValue('');

      expect(result).toBe(true);
    });

    it('should return true when value is null', () => {
      const result = isNullEquivalentTextFieldValue(null);

      expect(result).toBe(true);
    });
  });

  describe('non-null-equivalent values', () => {
    it('should return false when value is a non-empty string', () => {
      const result = isNullEquivalentTextFieldValue('hello');

      expect(result).toBe(false);
    });

    it('should return false when value is undefined', () => {
      const result = isNullEquivalentTextFieldValue(undefined);

      expect(result).toBe(false);
    });
  });
});
