import { resolvePrimaryFullNameSortSubField } from '@/object-metadata/utils/resolvePrimaryFullNameSortSubField';

describe('resolvePrimaryFullNameSortSubField', () => {
  it('returns the requested sub-field when it is a recognized full-name sub-field', () => {
    expect(
      resolvePrimaryFullNameSortSubField({
        requestedPrimarySubField: 'lastName',
      }),
    ).toBe('lastName');
    expect(
      resolvePrimaryFullNameSortSubField({
        requestedPrimarySubField: 'firstName',
      }),
    ).toBe('firstName');
  });

  it('falls back to firstName when no request is given', () => {
    expect(resolvePrimaryFullNameSortSubField()).toBe('firstName');
    expect(resolvePrimaryFullNameSortSubField({})).toBe('firstName');
    expect(
      resolvePrimaryFullNameSortSubField({ requestedPrimarySubField: null }),
    ).toBe('firstName');
    expect(
      resolvePrimaryFullNameSortSubField({
        requestedPrimarySubField: undefined,
      }),
    ).toBe('firstName');
  });

  it('falls back to firstName when the requested sub-field is not recognized', () => {
    expect(
      resolvePrimaryFullNameSortSubField({
        requestedPrimarySubField: 'middleName',
      }),
    ).toBe('firstName');
  });
});
