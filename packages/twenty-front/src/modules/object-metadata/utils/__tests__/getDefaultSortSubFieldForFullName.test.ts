import {
  FULL_NAME_DEFAULT_SORT_SUB_FIELD,
  getDefaultSortSubFieldForFullName,
} from '@/object-metadata/utils/getDefaultSortSubFieldForFullName';

describe('getDefaultSortSubFieldForFullName', () => {
  it('returns the configured sub-field when set', () => {
    expect(
      getDefaultSortSubFieldForFullName({ defaultSortSubField: 'lastName' }),
    ).toBe('lastName');
  });

  it('falls back to firstName when settings are null', () => {
    expect(getDefaultSortSubFieldForFullName(null)).toBe(
      FULL_NAME_DEFAULT_SORT_SUB_FIELD,
    );
  });

  it('falls back to firstName when settings are undefined', () => {
    expect(getDefaultSortSubFieldForFullName(undefined)).toBe(
      FULL_NAME_DEFAULT_SORT_SUB_FIELD,
    );
  });

  it('falls back to firstName when defaultSortSubField is not set', () => {
    expect(getDefaultSortSubFieldForFullName({})).toBe(
      FULL_NAME_DEFAULT_SORT_SUB_FIELD,
    );
  });
});
