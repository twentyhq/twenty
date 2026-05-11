import { ADDRESS_DEFAULT_SORT_SUB_FIELD } from '@/object-metadata/constants/AddressDefaultSortSubField';
import { getDefaultSortSubFieldForAddress } from '@/object-metadata/utils/getDefaultSortSubFieldForAddress';

describe('getDefaultSortSubFieldForAddress', () => {
  it('falls back to addressCity when subFields are unset', () => {
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

  it('falls back to addressCity when it is in the enabled subFields', () => {
    expect(
      getDefaultSortSubFieldForAddress({
        subFields: ['addressStreet1', 'addressCity'],
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
