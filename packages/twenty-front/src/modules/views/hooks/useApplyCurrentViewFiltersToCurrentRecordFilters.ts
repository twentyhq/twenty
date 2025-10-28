import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useMapViewFiltersToFilters } from './useMapViewFiltersToFilters';

export const useApplyCurrentViewFiltersToCurrentRecordFilters = () => {
  const currentViewId = useRecoilComponentValue(
    contextStoreCurrentViewIdComponentState,
  );

  const setCurrentRecordFilters = useSetRecoilComponentState(
    currentRecordFiltersComponentState,
  );

  const { mapViewFiltersToRecordFilters } = useMapViewFiltersToFilters();

  const applyCurrentViewFiltersToCurrentRecordFilters = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const currentView = snapshot
          .getLoadable(
            coreViewFromViewIdFamilySelector({
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
