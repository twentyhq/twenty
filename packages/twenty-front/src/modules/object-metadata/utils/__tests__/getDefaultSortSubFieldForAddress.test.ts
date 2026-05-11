import {
  ADDRESS_DEFAULT_SORT_SUB_FIELD,
  getDefaultSortSubFieldForAddress,
} from '@/object-metadata/utils/getDefaultSortSubFieldForAddress';

describe('getDefaultSortSubFieldForAddress', () => {
  it('returns the configured sub-field when it is in the enabled subFields', () => {
    expect(
      getDefaultSortSubFieldForAddress({
        subFields: ['addressStreet1', 'addressState'],
        defaultSortSubField: 'addressState',
      }),
    ).toBe('addressState');
  });

  it('returns the configured sub-field when subFields is unset', () => {
    expect(
      getDefaultSortSubFieldForAddress({
        defaultSortSubField: 'addressCountry',
      }),
    ).toBe('addressCountry');
  });

  it('falls back to addressCity when no sub-field is configured', () => {
    expect(getDefaultSortSubFieldForAddress(null)).toBe(
      ADDRESS_DEFAULT_SORT_SUB_FIELD,
    );
    expect(getDefaultSortSubFieldForAddress(undefined)).toBe(
      ADDRESS_DEFAULT_SORT_SUB_FIELD,
    );
    expect(getDefaultSortSubFieldForAddress({})).toBe(
      ADDRESS_DEFAULT_SORT_SUB_FIELD,
    );
  });

  it('falls back to addressCity when the configured sub-field is disabled', () => {
    expect(
      getDefaultSortSubFieldForAddress({
        subFields: ['addressStreet1', 'addressCity'],
        defaultSortSubField: 'addressState',
      }),
    ).toBe('addressCity');
  });

  it('falls back to the first enabled sub-field when addressCity is disabled', () => {
    expect(
      getDefaultSortSubFieldForAddress({
        subFields: ['addressStreet1', 'addressState'],
      }),
    ).toBe('addressStreet1');
  });
});
