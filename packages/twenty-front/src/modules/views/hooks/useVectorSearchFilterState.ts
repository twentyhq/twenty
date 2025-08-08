import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isVectorSearchFilter } from '@/views/utils/isVectorSearchFilter';

export const useVectorSearchFilterState = () => {
  const currentRecordFilters = useRecoilComponentValue(
    currentRecordFiltersComponentState,
  );

  const getExistingVectorSearchFilter = () => {
    return currentRecordFilters.find(isVectorSearchFilter);
  };

  return {
    getExistingVectorSearchFilter,
  };
};
