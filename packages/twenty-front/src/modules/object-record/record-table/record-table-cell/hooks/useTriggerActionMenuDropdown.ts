import { useRecoilCallback } from 'recoil';

import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { recordIndexActionMenuDropdownPositionComponentState } from '@/action-menu/states/recordIndexActionMenuDropdownPositionComponentState';
import { getActionBarIdFromActionMenuId } from '@/action-menu/utils/getActionBarIdFromActionMenuId';
import { getActionMenuDropdownIdFromActionMenuId } from '@/action-menu/utils/getActionMenuDropdownIdFromActionMenuId';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { isBottomBarOpenedComponentState } from '@/ui/layout/bottom-bar/states/isBottomBarOpenedComponentState';
import { useSetActiveDropdownFocusIdAndMemorizePrevious } from '@/ui/layout/dropdown/hooks/useSetFocusedDropdownIdAndMemorizePrevious';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';

export const useTriggerActionMenuDropdown = ({
  recordTableId,
}: {
  recordTableId: string;
}) => {
  const actionMenuInstanceId = useAvailableComponentInstanceIdOrThrow(
    ActionMenuComponentInstanceContext,
  );

  const isRowSelectedFamilyState = useRecoilComponentCallbackStateV2(
    isRowSelectedComponentFamilyState,
    recordTableId,
  );

  const recordIndexActionMenuDropdownPositionState = extractComponentState(
    recordIndexActionMenuDropdownPositionComponentState,
    getActionMenuDropdownIdFromActionMenuId(actionMenuInstanceId),
  );

  const isActionMenuDropdownOpenState = extractComponentState(
    isDropdownOpenComponentState,
    getActionMenuDropdownIdFromActionMenuId(actionMenuInstanceId),
  );

  const isActionBarOpenState = isBottomBarOpenedComponentState.atomFamily({
    instanceId: getActionBarIdFromActionMenuId(actionMenuInstanceId),
  });

  const { setActiveDropdownFocusIdAndMemorizePrevious } =
    useSetActiveDropdownFocusIdAndMemorizePrevious();

  const triggerActionMenuDropdown = useRecoilCallback(
    ({ set, snapshot }) =>
      (event: React.MouseEvent, recordId: string) => {
        event.preventDefault();

        set(recordIndexActionMenuDropdownPositionState, {
          x: event.pageX,
          y: event.pageY,
        });

        const isRowSelected = getSnapshotValue(
          snapshot,
          isRowSelectedFamilyState(recordId),
        );

        if (isRowSelected !== true) {
          set(isRowSelectedFamilyState(recordId), true);
        }

        set(isActionBarOpenState, false);
        set(isActionMenuDropdownOpenState, true);

        const actionMenuDropdownId =
          getActionMenuDropdownIdFromActionMenuId(actionMenuInstanceId);

        setActiveDropdownFocusIdAndMemorizePrevious(actionMenuDropdownId);
      },
    [
      isActionBarOpenState,
      isActionMenuDropdownOpenState,
      isRowSelectedFamilyState,
      recordIndexActionMenuDropdownPositionState,
      setActiveDropdownFocusIdAndMemorizePrevious,
      actionMenuInstanceId,
    ],
  );

  return { triggerActionMenuDropdown };
};
