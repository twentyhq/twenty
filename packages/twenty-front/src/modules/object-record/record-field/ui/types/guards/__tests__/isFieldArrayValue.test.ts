import { isFieldArrayValue } from '@/object-record/record-field/ui/types/guards/isFieldArrayValue';

describe('isFieldArrayValue', () => {
  it('should return true for string arrays', () => {
    expect(isFieldArrayValue(['a', 'b', 'c'])).toBe(true);
    expect(isFieldArrayValue([])).toBe(true);
  });

  it('should return true for null', () => {
    expect(isFieldArrayValue(null)).toBe(true);
  });

  it('should return false for non-array values', () => {
    expect(isFieldArrayValue('string')).toBe(false);
    expect(isFieldArrayValue(42)).toBe(false);
    expect(isFieldArrayValue(undefined)).toBe(false);
  });

  it('should return false for arrays of non-strings', () => {
    expect(isFieldArrayValue([1, 2, 3])).toBe(false);
  });
});
