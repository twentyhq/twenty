import { isUpdateRecordValueEmpty } from '@/object-record/record-update-multiple/utils/isUpdateRecordValueEmpty';

describe('isUpdateRecordValueEmpty', () => {
  it('should return true for null or undefined', () => {
    expect(isUpdateRecordValueEmpty(null)).toBe(true);
    expect(isUpdateRecordValueEmpty(undefined)).toBe(true);
  });

  it('should return true for empty string', () => {
    expect(isUpdateRecordValueEmpty('')).toBe(true);
  });

  it('should return true for empty array', () => {
    expect(isUpdateRecordValueEmpty([])).toBe(true);
  });

  it('should return false for non-empty array', () => {
    expect(isUpdateRecordValueEmpty([1])).toBe(false);
  });

  it('should return true for object with all empty values', () => {
    expect(isUpdateRecordValueEmpty({ a: null, b: '' })).toBe(true);
  });

  it('should return false for object with non-empty values', () => {
    expect(isUpdateRecordValueEmpty({ a: 1 })).toBe(false);
  });

  it('should return false for Date object', () => {
    expect(isUpdateRecordValueEmpty(new Date())).toBe(false);
  });
});
