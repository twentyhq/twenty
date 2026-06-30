import { isFieldRawJsonValue } from '@/object-record/record-field/ui/types/guards/isFieldRawJsonValue';

describe('isFieldRawJsonValue', () => {
  it('should return true for JSON objects', () => {
    expect(isFieldRawJsonValue({ key: 'value' })).toBe(true);
    expect(isFieldRawJsonValue({ nested: { deep: true } })).toBe(true);
  });

  it('should return true for JSON arrays', () => {
    expect(isFieldRawJsonValue([1, 2, 3])).toBe(true);
    expect(isFieldRawJsonValue([])).toBe(true);
  });

  it('should return true for null', () => {
    expect(isFieldRawJsonValue(null)).toBe(true);
  });

  it('should return false for literal values other than null', () => {
    expect(isFieldRawJsonValue('string')).toBe(false);
    expect(isFieldRawJsonValue(42)).toBe(false);
    expect(isFieldRawJsonValue(true)).toBe(false);
  });
});
