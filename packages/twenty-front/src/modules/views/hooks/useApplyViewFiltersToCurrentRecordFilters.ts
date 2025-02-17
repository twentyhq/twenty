import { useFilterableFieldMetadataItemsInRecordIndexContext } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItemsInRecordIndexContext';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { ViewFilter } from '@/views/types/ViewFilter';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';

export const useApplyViewFiltersToCurrentRecordFilters = () => {
  const setCurrentRecordFilters = useSetRecoilComponentStateV2(
    currentRecordFiltersComponentState,
  );

  const { filterableFieldMetadataItems } =
    useFilterableFieldMetadataItemsInRecordIndexContext();

  const applyViewFiltersToCurrentRecordFilters = (
    viewFilters: ViewFilter[],
  ) => {
    const recordFiltersToApply = mapViewFiltersToFilters(
      viewFilters,
      filterableFieldMetadataItems,
    );

    setCurrentRecordFilters(recordFiltersToApply);
  };

  return {
    applyViewFiltersToCurrentRecordFilters,
  };
};
