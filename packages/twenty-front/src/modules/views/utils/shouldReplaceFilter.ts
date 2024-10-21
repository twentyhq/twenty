import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { isDefined } from 'twenty-ui';

export const shouldReplaceFilter = (
  oldFilter: Pick<Filter, 'id' | 'fieldMetadataId' | 'viewFilterGroupId'>,
  newFilter: Pick<Filter, 'id' | 'fieldMetadataId' | 'viewFilterGroupId'>,
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
