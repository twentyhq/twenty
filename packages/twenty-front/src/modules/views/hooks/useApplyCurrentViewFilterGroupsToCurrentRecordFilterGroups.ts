import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';
import { mapViewFilterGroupsToRecordFilterGroups } from '@/views/utils/mapViewFilterGroupsToRecordFilterGroups';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useApplyCurrentViewFilterGroupsToCurrentRecordFilterGroups =
  () => {
    const currentViewId = useRecoilComponentValue(
      contextStoreCurrentViewIdComponentState,
    );

    const setCurrentRecordFilterGroups = useSetRecoilComponentState(
      currentRecordFilterGroupsComponentState,
    );

    const currentRecordFilterGroupsCallbackState =
      useRecoilComponentCallbackState(currentRecordFilterGroupsComponentState);

    const applyCurrentViewFilterGroupsToCurrentRecordFilterGroups =
      useRecoilCallback(
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
              const currentRecordFilterGroups = snapshot
                .getLoadable(currentRecordFilterGroupsCallbackState)
                .getValue();

              const newRecordFilterGroups =
                mapViewFilterGroupsToRecordFilterGroups(
                  currentView.viewFilterGroups ?? [],
                );

              if (
                !isDeeplyEqual(currentRecordFilterGroups, newRecordFilterGroups)
              ) {
                setCurrentRecordFilterGroups(newRecordFilterGroups);
              }
            }
          },
        [
          currentViewId,
          setCurrentRecordFilterGroups,
          currentRecordFilterGroupsCallbackState,
        ],
      );

    return {
      applyCurrentViewFilterGroupsToCurrentRecordFilterGroups,
    };
  };
