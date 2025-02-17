import { useFilterableFieldMetadataItems } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItems';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { ViewFilter } from '@/views/types/ViewFilter';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';

export const useApplyViewFiltersToCurrentRecordFilters = () => {
  const setCurrentRecordFilters = useSetRecoilComponentStateV2(
    currentRecordFiltersComponentState,
  );

  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const { filterableFieldMetadataItems } = useFilterableFieldMetadataItems(
    objectMetadataItem.id,
  );

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
