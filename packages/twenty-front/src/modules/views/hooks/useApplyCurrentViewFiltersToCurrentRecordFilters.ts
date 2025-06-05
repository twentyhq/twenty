import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { prefetchViewFromViewIdFamilySelector } from '@/prefetch/states/selector/prefetchViewFromViewIdFamilySelector';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useRecoilCallback } from 'recoil';
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

  const applyCurrentViewFiltersToCurrentRecordFilters = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const currentView = snapshot
          .getLoadable(
            prefetchViewFromViewIdFamilySelector({
              viewId: currentViewId ?? '',
            }),
          )
          .getValue();

        if (isDefined(currentView)) {
          setCurrentRecordFilters(
            mapViewFiltersToRecordFilters(currentView.viewFilters),
          );
        }
      },
    [currentViewId, mapViewFiltersToRecordFilters, setCurrentRecordFilters],
  );

  return {
    applyCurrentViewFiltersToCurrentRecordFilters,
  };
};
