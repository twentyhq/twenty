import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { prefetchViewFromViewIdFamilySelector } from '@/prefetch/states/selector/prefetchViewFromViewIdFamilySelector';
import { useRecoilComponentFamilyState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useMapViewFiltersToFilters } from '@/views/hooks/useMapViewFiltersToFilters';
import { hasInitializedCurrentRecordFiltersComponentFamilyState } from '@/views/states/hasInitializedCurrentRecordFiltersComponentFamilyState';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const ViewBarRecordFilterEffect = () => {
  const currentViewId = useRecoilComponentValue(
    contextStoreCurrentViewIdComponentState,
  );

  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const currentView = useRecoilValue(
    prefetchViewFromViewIdFamilySelector({
      viewId: currentViewId ?? '',
    }),
  );

  const [
    hasInitializedCurrentRecordFilters,
    setHasInitializedCurrentRecordFilters,
  ] = useRecoilComponentFamilyState(
    hasInitializedCurrentRecordFiltersComponentFamilyState,
    {
      viewId: currentViewId ?? undefined,
    },
  );

  const setCurrentRecordFilters = useSetRecoilComponentState(
    currentRecordFiltersComponentState,
  );

  const { mapViewFiltersToRecordFilters } = useMapViewFiltersToFilters();

  useEffect(() => {
    if (!hasInitializedCurrentRecordFilters && isDefined(currentView)) {
      if (currentView.objectMetadataId !== objectMetadataItem.id) {
        return;
      }

      setCurrentRecordFilters(
        mapViewFiltersToRecordFilters(currentView.viewFilters),
      );

      setHasInitializedCurrentRecordFilters(true);
    }
  }, [
    currentViewId,
    setCurrentRecordFilters,
    mapViewFiltersToRecordFilters,
    hasInitializedCurrentRecordFilters,
    setHasInitializedCurrentRecordFilters,
    currentView,
    objectMetadataItem,
  ]);

  return null;
};
