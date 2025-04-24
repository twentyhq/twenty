import { useRecoilCallback } from 'recoil';

import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { recordIndexActionMenuDropdownPositionComponentState } from '@/action-menu/states/recordIndexActionMenuDropdownPositionComponentState';
import { ActionMenuDropdownHotkeyScope } from '@/action-menu/types/ActionMenuDropdownHotKeyScope';
import { getActionMenuDropdownIdFromActionMenuId } from '@/action-menu/utils/getActionMenuDropdownIdFromActionMenuId';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { useDropdownV2 } from '@/ui/layout/dropdown/hooks/useDropdownV2';
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

  const actionMenuDropdownId =
    getActionMenuDropdownIdFromActionMenuId(actionMenuInstanceId);

  const recordIndexActionMenuDropdownPositionState = extractComponentState(
    recordIndexActionMenuDropdownPositionComponentState,
    actionMenuDropdownId,
  );

  const { openDropdown } = useDropdownV2();

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

        openDropdown(actionMenuDropdownId, {
          scope: ActionMenuDropdownHotkeyScope.ActionMenuDropdown,
        });
      },
    [
      recordIndexActionMenuDropdownPositionState,
      isRowSelectedFamilyState,
      openDropdown,
      actionMenuDropdownId,
    ],
  );

  return { triggerActionMenuDropdown };
};
