import { FULL_NAME_DEFAULT_SORT_SUB_FIELD } from '@/object-metadata/constants/FullNameDefaultSortSubField';
import { getDefaultSortSubFieldForFullName } from '@/object-metadata/utils/getDefaultSortSubFieldForFullName';

describe('getDefaultSortSubFieldForFullName', () => {
  it('returns the FullName default sort sub-field constant', () => {
    expect(getDefaultSortSubFieldForFullName()).toBe(
      FULL_NAME_DEFAULT_SORT_SUB_FIELD,
    );
  });
});
