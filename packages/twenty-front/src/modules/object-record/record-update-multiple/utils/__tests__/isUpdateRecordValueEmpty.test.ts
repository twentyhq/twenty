import { isUpdateRecordValueEmpty } from '../isUpdateRecordValueEmpty';

describe('isUpdateRecordValueEmpty', () => {
  it('should return true for null or undefined', () => {
    expect(isUpdateRecordValueEmpty(null)).toBe(true);
    expect(isUpdateRecordValueEmpty(undefined)).toBe(true);
    expect(isUpdateRecordValueEmpty('')).toBe(true);
  });

  it('should return true for empty arrays', () => {
    expect(isUpdateRecordValueEmpty([])).toBe(true);
  });

  it('should return true for objects with only empty values', () => {
    expect(isUpdateRecordValueEmpty({ a: null, b: '' })).toBe(true);
    expect(isUpdateRecordValueEmpty({ a: undefined })).toBe(true);
  });

  it('should return false for non-empty values', () => {
    expect(isUpdateRecordValueEmpty('abc')).toBe(false);
    expect(isUpdateRecordValueEmpty(['a'])).toBe(false);
    expect(isUpdateRecordValueEmpty({ a: 'val' })).toBe(false);
    expect(isUpdateRecordValueEmpty(0)).toBe(false);
    expect(isUpdateRecordValueEmpty(false)).toBe(false);
  });

  it('should return false for objects with mixed empty and non-empty values', () => {
    expect(isUpdateRecordValueEmpty({ a: '', b: 'val' })).toBe(false);
  });
});
