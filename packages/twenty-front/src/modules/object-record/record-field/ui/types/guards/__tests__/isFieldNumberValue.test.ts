import { isFieldNumberValue } from '@/object-record/record-field/ui/types/guards/isFieldNumberValue';

describe('isFieldNumberValue', () => {
  it('should return true for numbers', () => {
    expect(isFieldNumberValue(42)).toBe(true);
    expect(isFieldNumberValue(0)).toBe(true);
    expect(isFieldNumberValue(-1.5)).toBe(true);
  });

  it('should return true for null', () => {
    expect(isFieldNumberValue(null)).toBe(true);
  });

  it('should return false for non-number values', () => {
    expect(isFieldNumberValue('42')).toBe(false);
    expect(isFieldNumberValue(undefined)).toBe(false);
    expect(isFieldNumberValue({})).toBe(false);
  });
});
