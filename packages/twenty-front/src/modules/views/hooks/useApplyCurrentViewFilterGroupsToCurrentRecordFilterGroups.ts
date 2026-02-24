import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilComponentStateV2';
import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';
import { mapViewFilterGroupsToRecordFilterGroups } from '@/views/utils/mapViewFilterGroupsToRecordFilterGroups';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useApplyCurrentViewFilterGroupsToCurrentRecordFilterGroups =
  () => {
    const currentViewId = useRecoilComponentValueV2(
      contextStoreCurrentViewIdComponentState,
    );

    const setCurrentRecordFilterGroups = useSetRecoilComponentStateV2(
      currentRecordFilterGroupsComponentState,
    );

    const currentRecordFilterGroupsAtom =
      useRecoilComponentStateCallbackStateV2(
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
          const currentRecordFilterGroups = store.get(
            currentRecordFilterGroupsAtom,
          );

          const newRecordFilterGroups = mapViewFilterGroupsToRecordFilterGroups(
            currentView.viewFilterGroups ?? [],
          );

          if (
            !isDeeplyEqual(currentRecordFilterGroups, newRecordFilterGroups)
          ) {
            setCurrentRecordFilterGroups(newRecordFilterGroups);
          }
        }
      }, [
        currentViewId,
        setCurrentRecordFilterGroups,
        currentRecordFilterGroupsAtom,
        store,
      ]);

    return {
      applyCurrentViewFilterGroupsToCurrentRecordFilterGroups,
    };
  };
