import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { prefetchViewFromViewIdFamilySelector } from '@/prefetch/states/selector/prefetchViewFromViewIdFamilySelector';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { mapViewFilterGroupsToRecordFilterGroups } from '@/views/utils/mapViewFilterGroupsToRecordFilterGroups';
import { useRecoilCallback } from 'recoil';

import { isDefined } from 'twenty-shared';

export const useApplyCurrentViewFilterGroupsToCurrentRecordFilterGroups =
  () => {
    const currentViewId = useRecoilComponentValueV2(
      contextStoreCurrentViewIdComponentState,
    );

    const setCurrentRecordFilterGroups = useSetRecoilComponentStateV2(
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
              setCurrentRecordFilterGroups(
                mapViewFilterGroupsToRecordFilterGroups(
                  currentView.viewFilterGroups ?? [],
                ),
              );
            }
          },
        [currentViewId, setCurrentRecordFilterGroups],
      );

    return {
      applyCurrentViewFilterGroupsToCurrentRecordFilterGroups,
    };
  };
