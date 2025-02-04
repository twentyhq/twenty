import { useFilterDefinitionsFromFilterableFieldMetadataItems } from '@/object-record/record-filter/hooks/useFilterDefinitionsFromFilterableFieldMetadataItems';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { ViewFilter } from '@/views/types/ViewFilter';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';

export const useApplyViewFiltersToCurrentRecordFilters = () => {
  const setCurrentRecordFilters = useSetRecoilComponentStateV2(
    currentRecordFiltersComponentState,
  );

  const { filterDefinitions } =
    useFilterDefinitionsFromFilterableFieldMetadataItems();

  const applyViewFiltersToCurrentRecordFilters = (
    viewFilters: ViewFilter[],
  ) => {
    const recordFiltersToApply = mapViewFiltersToFilters(
      viewFilters,
      filterDefinitions,
    );

    setCurrentRecordFilters(recordFiltersToApply);
  };

  return {
    applyViewFiltersToCurrentRecordFilters,
  };
};
