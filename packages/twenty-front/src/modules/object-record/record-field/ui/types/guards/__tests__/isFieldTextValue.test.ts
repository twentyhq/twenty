import { isFieldTextValue } from '@/object-record/record-field/ui/types/guards/isFieldTextValue';

describe('isFieldTextValue', () => {
  it('should return true for strings', () => {
    expect(isFieldTextValue('hello')).toBe(true);
    expect(isFieldTextValue('')).toBe(true);
  });

  it('should return false for non-string values', () => {
    expect(isFieldTextValue(42)).toBe(false);
    expect(isFieldTextValue(null)).toBe(false);
    expect(isFieldTextValue(undefined)).toBe(false);
    expect(isFieldTextValue(true)).toBe(false);
  });
});
