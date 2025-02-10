import { formatFieldMetadataItemAsFilterDefinition } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { useFilterableFieldMetadataItemsInRecordIndexContext } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItemsInRecordIndexContext';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { currentViewIdComponentState } from '@/views/states/currentViewIdComponentState';
import { View } from '@/views/types/View';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared';

export const ViewBarRecordFilterEffect = () => {
  const { records: views, isDataPrefetched } = usePrefetchedData<View>(
    PrefetchKey.AllViews,
  );

  const currentViewId = useRecoilComponentValueV2(currentViewIdComponentState);

  const setCurrentRecordFilters = useSetRecoilComponentStateV2(
    currentRecordFiltersComponentState,
  );

  const { filterableFieldMetadataItems } =
    useFilterableFieldMetadataItemsInRecordIndexContext();

  useEffect(() => {
    if (isDataPrefetched) {
      const currentView = views.find((view) => view.id === currentViewId);

      const filterDefinitions = filterableFieldMetadataItems.map(
        (fieldMetadataItem) =>
          formatFieldMetadataItemAsFilterDefinition({
            field: fieldMetadataItem,
          }),
      );

      if (isDefined(currentView)) {
        setCurrentRecordFilters(
          mapViewFiltersToFilters(currentView.viewFilters, filterDefinitions),
        );
      }
    }
  }, [
    isDataPrefetched,
    views,
    currentViewId,
    setCurrentRecordFilters,
    filterableFieldMetadataItems,
  ]);

  return null;
};
