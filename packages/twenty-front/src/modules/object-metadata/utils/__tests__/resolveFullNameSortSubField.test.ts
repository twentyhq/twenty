import { resolveFullNameSortSubField } from '@/object-metadata/utils/resolveFullNameSortSubField';

describe('resolveFullNameSortSubField', () => {
  it('returns the requested sub-field when it is a recognized full-name sub-field', () => {
    expect(resolveFullNameSortSubField({ compositeSubField: 'lastName' })).toBe(
      'lastName',
    );
    expect(
      resolveFullNameSortSubField({ compositeSubField: 'firstName' }),
    ).toBe('firstName');
  });

  it('falls back to firstName when no request is given', () => {
    expect(resolveFullNameSortSubField()).toBe('firstName');
    expect(resolveFullNameSortSubField({})).toBe('firstName');
    expect(resolveFullNameSortSubField({ compositeSubField: null })).toBe(
      'firstName',
    );
    expect(resolveFullNameSortSubField({ compositeSubField: undefined })).toBe(
      'firstName',
    );
  });

  it('falls back to firstName when the requested sub-field is not recognized', () => {
    expect(
      resolveFullNameSortSubField({ compositeSubField: 'middleName' }),
    ).toBe('firstName');
  });
});
