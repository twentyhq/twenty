import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { prefetchViewFromViewIdFamilySelector } from '@/prefetch/states/selector/prefetchViewFromViewIdFamilySelector';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { mapViewFilterGroupsToRecordFilterGroups } from '@/views/utils/mapViewFilterGroupsToRecordFilterGroups';
import { useRecoilCallback } from 'recoil';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { isDefined } from 'twenty-shared/utils';

export const useApplyCurrentViewFilterGroupsToCurrentRecordFilterGroups =
  () => {
    const currentViewId = useRecoilComponentValueV2(
      contextStoreCurrentViewIdComponentState,
    );

    const setCurrentRecordFilterGroups = useSetRecoilComponentStateV2(
      currentRecordFilterGroupsComponentState,
    );

    const currentRecordFilterGroupsCallbackState =
      useRecoilComponentCallbackStateV2(
        currentRecordFilterGroupsComponentState,
      );

    const applyCurrentViewFilterGroupsToCurrentRecordFilterGroups =
      useRecoilCallback(
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
