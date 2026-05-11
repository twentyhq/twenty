import { resolveFullNameSortSubField } from '@/object-metadata/utils/resolveFullNameSortSubField';

describe('resolveFullNameSortSubField', () => {
  it('returns the requested sub-field when it is a recognized full-name sub-field', () => {
    expect(resolveFullNameSortSubField('lastName')).toBe('lastName');
    expect(resolveFullNameSortSubField('firstName')).toBe('firstName');
  });

  it('falls back to firstName when no request is given', () => {
    expect(resolveFullNameSortSubField()).toBe('firstName');
    expect(resolveFullNameSortSubField(null)).toBe('firstName');
    expect(resolveFullNameSortSubField(undefined)).toBe('firstName');
  });

  it('falls back to firstName when the requested sub-field is not recognized', () => {
    expect(resolveFullNameSortSubField('middleName')).toBe('firstName');
  });
});
