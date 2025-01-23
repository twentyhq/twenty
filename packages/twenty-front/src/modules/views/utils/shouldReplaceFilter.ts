import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { isDefined } from 'twenty-ui';

export const shouldReplaceFilter = (
  oldFilter: Pick<RecordFilter, 'id' | 'fieldMetadataId' | 'viewFilterGroupId'>,
  newFilter: Pick<RecordFilter, 'id' | 'fieldMetadataId' | 'viewFilterGroupId'>,
) => {
  const isNewFilterAdvancedFilter = isDefined(newFilter.viewFilterGroupId);

  if (isNewFilterAdvancedFilter) {
    return newFilter.id === oldFilter.id;
  } else {
    return (
      newFilter.fieldMetadataId === oldFilter.fieldMetadataId &&
      !oldFilter.viewFilterGroupId
    );
  }
};
