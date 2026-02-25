import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';
import { mapViewFilterGroupsToRecordFilterGroups } from '@/views/utils/mapViewFilterGroupsToRecordFilterGroups';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useApplyCurrentViewFilterGroupsToCurrentRecordFilterGroups =
  () => {
    const currentViewId = useAtomComponentStateValue(
      contextStoreCurrentViewIdComponentState,
    );

    const setCurrentRecordFilterGroups = useSetAtomComponentState(
      currentRecordFilterGroupsComponentState,
    );

    const currentRecordFilterGroups = useAtomComponentStateCallbackState(
      currentRecordFilterGroupsComponentState,
    );

    const store = useStore();

    const applyCurrentViewFilterGroupsToCurrentRecordFilterGroups =
      useCallback(() => {
        const currentView = store.get(
          coreViewFromViewIdFamilySelector.selectorFamily({
            viewId: currentViewId ?? '',
          }),
        );

        if (isDefined(currentView)) {
          const existingRecordFilterGroups = store.get(
            currentRecordFilterGroups,
          );

          const newRecordFilterGroups = mapViewFilterGroupsToRecordFilterGroups(
            currentView.viewFilterGroups ?? [],
          );

          if (
            !isDeeplyEqual(existingRecordFilterGroups, newRecordFilterGroups)
          ) {
            setCurrentRecordFilterGroups(newRecordFilterGroups);
          }
        }
      }, [
        currentViewId,
        setCurrentRecordFilterGroups,
        currentRecordFilterGroups,
        store,
      ]);

    return {
      applyCurrentViewFilterGroupsToCurrentRecordFilterGroups,
    };
  };
