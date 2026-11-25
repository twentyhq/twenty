import { isCanonicalRecordField } from '@/object-record/record-field/utils/isCanonicalRecordField';

describe('isCanonicalRecordField', () => {
  it('treats a column without the flag as canonical', () => {
    expect(isCanonicalRecordField({})).toBe(true);
  });

  it('follows the flag when it is set', () => {
    expect(isCanonicalRecordField({ isCanonical: true })).toBe(true);
    expect(isCanonicalRecordField({ isCanonical: false })).toBe(false);
  });
});
