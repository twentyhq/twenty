import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilComponentStateV2';
import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useMapViewFiltersToFilters } from './useMapViewFiltersToFilters';

export const useApplyCurrentViewFiltersToCurrentRecordFilters = () => {
  const currentViewId = useRecoilComponentValueV2(
    contextStoreCurrentViewIdComponentState,
  );

  const setCurrentRecordFilters = useSetRecoilComponentStateV2(
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
