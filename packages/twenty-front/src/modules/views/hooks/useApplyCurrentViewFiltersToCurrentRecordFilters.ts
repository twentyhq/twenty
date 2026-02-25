import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useMapViewFiltersToFilters } from './useMapViewFiltersToFilters';

export const useApplyCurrentViewFiltersToCurrentRecordFilters = () => {
  const currentViewId = useAtomComponentStateValue(
    contextStoreCurrentViewIdComponentState,
  );

  const setCurrentRecordFilters = useSetAtomComponentState(
    currentRecordFiltersComponentState,
  );

  const { mapViewFiltersToRecordFilters } = useMapViewFiltersToFilters();

  const store = useStore();

  const applyCurrentViewFiltersToCurrentRecordFilters = useCallback(() => {
    const currentView = store.get(
      coreViewFromViewIdFamilySelector.selectorFamily({
        viewId: currentViewId ?? '',
      }),
    );

    if (isDefined(currentView)) {
      setCurrentRecordFilters(
        mapViewFiltersToRecordFilters(currentView.viewFilters),
      );
    }
  }, [
    currentViewId,
    mapViewFiltersToRecordFilters,
    setCurrentRecordFilters,
    store,
  ]);

  return {
    applyCurrentViewFiltersToCurrentRecordFilters,
  };
};
