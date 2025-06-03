import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';

export const useVectorSearchFilterState = () => {
  const currentRecordFilters = useRecoilComponentValueV2(
    currentRecordFiltersComponentState,
  );

  const getExistingVectorSearchFilter = () => {
    return currentRecordFilters.find(
      (filter) => filter.operand === ViewFilterOperand.VectorSearch,
    );
  };

  return {
    getExistingVectorSearchFilter,
  };
};
