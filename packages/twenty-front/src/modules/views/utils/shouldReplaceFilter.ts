import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { compareStrictlyExceptForNullAndUndefined } from '~/utils/compareStrictlyExceptForNullAndUndefined';
import { isDefined } from 'twenty-shared/utils';

export const shouldReplaceFilter = (
  oldFilter: Pick<
    RecordFilter,
    'id' | 'fieldMetadataId' | 'recordFilterGroupId'
  >,
  newFilter: Pick<
    RecordFilter,
    'id' | 'fieldMetadataId' | 'recordFilterGroupId'
  >,
) => {
  const isNewFilterAdvancedFilter = isDefined(newFilter.recordFilterGroupId);

  if (isNewFilterAdvancedFilter) {
    return newFilter.id === oldFilter.id;
  } else {
    return (
      compareStrictlyExceptForNullAndUndefined(
        newFilter.fieldMetadataId,
        oldFilter.fieldMetadataId,
      ) && !isDefined(oldFilter.recordFilterGroupId)
    );
  }
};
