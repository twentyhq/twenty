import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useMapViewFiltersToFilters } from '@/views/hooks/useMapViewFiltersToFilters';
import { hasInitializedCurrentRecordFiltersComponentFamilyState } from '@/views/states/hasInitializedCurrentRecordFiltersComponentFamilyState';
import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const ViewBarRecordFilterEffect = () => {
  const contextStoreCurrentViewId = useAtomComponentStateValue(
    contextStoreCurrentViewIdComponentState,
  );

  const { objectMetadataItem, recordIndexId } = useRecordIndexContextOrThrow();

  const currentView = useAtomFamilySelectorValue(
    coreViewFromViewIdFamilySelector,
    {
      viewId: contextStoreCurrentViewId ?? '',
    },
  );

  const [
    hasInitializedCurrentRecordFilters,
    setHasInitializedCurrentRecordFilters,
  ] = useAtomComponentFamilyState(
    hasInitializedCurrentRecordFiltersComponentFamilyState,
    {
      viewId: contextStoreCurrentViewId ?? undefined,
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
    contextStoreCurrentViewId,
    setCurrentRecordFilters,
    mapViewFiltersToRecordFilters,
    hasInitializedCurrentRecordFilters,
    setHasInitializedCurrentRecordFilters,
    currentView,
    objectMetadataItem,
  ]);

  return null;
};
