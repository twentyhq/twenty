import { isFieldTypeCompatibleWithRecordId } from '@/workflow/workflow-variables/utils/isFieldTypeCompatibleWithRecordId';

describe('isFieldTypeCompatibleWithRecordId', () => {
  it('should return true', () => {
    expect(isFieldTypeCompatibleWithRecordId('string')).toBe(true);
    expect(isFieldTypeCompatibleWithRecordId('unknown')).toBe(true);
    expect(isFieldTypeCompatibleWithRecordId()).toBe(true);
    expect(isFieldTypeCompatibleWithRecordId(undefined)).toBe(true);
  });
  it('should return false', () => {
    expect(isFieldTypeCompatibleWithRecordId('number')).toBe(false);
    expect(isFieldTypeCompatibleWithRecordId('boolean')).toBe(false);
    expect(isFieldTypeCompatibleWithRecordId('object')).toBe(false);
    expect(isFieldTypeCompatibleWithRecordId('array')).toBe(false);
  });
});
