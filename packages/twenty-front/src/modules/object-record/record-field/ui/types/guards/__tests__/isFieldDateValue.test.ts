import { isFieldDateValue } from '@/object-record/record-field/ui/types/guards/isFieldDateValue';

describe('isFieldDateValue', () => {
  it('should return true for valid date strings', () => {
    expect(isFieldDateValue('2024-01-15')).toBe(true);
    expect(isFieldDateValue('2024-01-15T10:30:00Z')).toBe(true);
  });

  it('should return true for null', () => {
    expect(isFieldDateValue(null)).toBe(true);
  });

  it('should return false for invalid date strings', () => {
    expect(isFieldDateValue('not-a-date')).toBe(false);
  });

  it('should return false for non-string values', () => {
    expect(isFieldDateValue(42)).toBe(false);
    expect(isFieldDateValue(undefined)).toBe(false);
  });
});
