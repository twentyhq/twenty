import { isFieldBooleanValue } from '@/object-record/record-field/ui/types/guards/isFieldBooleanValue';

describe('isFieldBooleanValue', () => {
  it('should return true for boolean values', () => {
    expect(isFieldBooleanValue(true)).toBe(true);
    expect(isFieldBooleanValue(false)).toBe(true);
  });

  it('should return false for non-boolean values', () => {
    expect(isFieldBooleanValue('true')).toBe(false);
    expect(isFieldBooleanValue(1)).toBe(false);
    expect(isFieldBooleanValue(null)).toBe(false);
    expect(isFieldBooleanValue(undefined)).toBe(false);
  });
});
