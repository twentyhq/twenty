import { contextStoreCurrentObjectMetadataItemComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useFilterableFieldMetadataItems } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItems';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { useRecoilComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { hasInitializedCurrentRecordFiltersComponentFamilyState } from '@/views/states/hasInitializedCurrentRecordFiltersComponentFamilyState';
import { View } from '@/views/types/View';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared';

export const ViewBarRecordFilterEffect = () => {
  const { records: views, isDataPrefetched } = usePrefetchedData<View>(
    PrefetchKey.AllViews,
  );

  const currentViewId = useRecoilComponentValueV2(
    contextStoreCurrentViewIdComponentState,
  );

  const contextStoreCurrentObjectMetadataItem = useRecoilComponentValueV2(
    contextStoreCurrentObjectMetadataItemComponentState,
  );

  const [
    hasInitializedCurrentRecordFilters,
    setHasInitializedCurrentRecordFilters,
  ] = useRecoilComponentFamilyStateV2(
    hasInitializedCurrentRecordFiltersComponentFamilyState,
    {
      viewId: currentViewId ?? undefined,
    },
  );

  const setCurrentRecordFilters = useSetRecoilComponentStateV2(
    currentRecordFiltersComponentState,
  );

  const currentRecordFilters = useRecoilComponentValueV2(
    currentRecordFiltersComponentState,
  );

  const { filterableFieldMetadataItems } = useFilterableFieldMetadataItems(
    contextStoreCurrentObjectMetadataItem?.id,
  );

  useEffect(() => {
    if (isDataPrefetched && !hasInitializedCurrentRecordFilters) {
      const currentView = views.find((view) => view.id === currentViewId);

      if (
        currentView?.objectMetadataId !==
        contextStoreCurrentObjectMetadataItem?.id
      ) {
        return;
      }

      if (isDefined(currentView)) {
        setCurrentRecordFilters(
          mapViewFiltersToFilters(
            currentView.viewFilters,
            filterableFieldMetadataItems,
          ),
        );
        setHasInitializedCurrentRecordFilters(true);
      }
    }
  }, [
    isDataPrefetched,
    views,
    currentViewId,
    setCurrentRecordFilters,
    filterableFieldMetadataItems,
    currentRecordFilters,
    hasInitializedCurrentRecordFilters,
    setHasInitializedCurrentRecordFilters,
    contextStoreCurrentObjectMetadataItem?.id,
  ]);

  return null;
};
