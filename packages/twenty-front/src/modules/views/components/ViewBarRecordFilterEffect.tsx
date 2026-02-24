import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyState';
import { useAtomComponentValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorValue';
import { useMapViewFiltersToFilters } from '@/views/hooks/useMapViewFiltersToFilters';
import { hasInitializedCurrentRecordFiltersComponentFamilyState } from '@/views/states/hasInitializedCurrentRecordFiltersComponentFamilyState';
import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const ViewBarRecordFilterEffect = () => {
  const currentViewId = useAtomComponentValue(
    contextStoreCurrentViewIdComponentState,
  );

  const { objectMetadataItem, recordIndexId } = useRecordIndexContextOrThrow();

  const currentView = useFamilySelectorValue(coreViewFromViewIdFamilySelector, {
    viewId: currentViewId ?? '',
  });

  const [
    hasInitializedCurrentRecordFilters,
    setHasInitializedCurrentRecordFilters,
  ] = useAtomComponentFamilyState(
    hasInitializedCurrentRecordFiltersComponentFamilyState,
    {
      viewId: currentViewId ?? undefined,
    },
  );

  const setCurrentRecordFilters = useSetAtomComponentState(
    currentRecordFiltersComponentState,
    recordIndexId,
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
