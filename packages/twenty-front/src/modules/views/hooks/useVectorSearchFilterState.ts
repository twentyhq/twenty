import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isVectorSearchFilter } from '@/views/utils/isVectorSearchFilter';

export const useVectorSearchFilterState = () => {
  const currentRecordFilters = useRecoilComponentValueV2(
    currentRecordFiltersComponentState,
  );

  const getExistingVectorSearchFilter = () => {
    return currentRecordFilters.find(isVectorSearchFilter);
  };

  return {
    getExistingVectorSearchFilter,
  };
};
