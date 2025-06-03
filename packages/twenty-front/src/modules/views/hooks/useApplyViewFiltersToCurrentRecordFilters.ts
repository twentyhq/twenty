import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { ViewFilter } from '@/views/types/ViewFilter';
import { useMapViewFiltersToFilters } from './useMapViewFiltersToFilters';

export const useApplyViewFiltersToCurrentRecordFilters = () => {
  const setCurrentRecordFilters = useSetRecoilComponentStateV2(
    currentRecordFiltersComponentState,
  );

  const { mapViewFiltersToRecordFilters } = useMapViewFiltersToFilters();

  const applyViewFiltersToCurrentRecordFilters = (
    viewFilters: ViewFilter[],
  ) => {
    const recordFiltersToApply = mapViewFiltersToRecordFilters(viewFilters);

    setCurrentRecordFilters(recordFiltersToApply);
  };

  return {
    applyViewFiltersToCurrentRecordFilters,
  };
};
