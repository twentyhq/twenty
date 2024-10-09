import { useRecoilCallback } from 'recoil';

import { actionMenuDropdownPositionComponentState } from '@/action-menu/states/actionMenuDropdownPositionComponentState';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { isBottomBarOpenedComponentState } from '@/ui/layout/bottom-bar/states/isBottomBarOpenedComponentState';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { getScopeIdFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdFromComponentId';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { extractComponentFamilyState } from '@/ui/utilities/state/component-state/utils/extractComponentFamilyState';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';

export const useTriggerActionMenuDropdown = ({
  recordTableId,
}: {
  recordTableId: string;
}) => {
  const triggerActionMenuDropdown = useRecoilCallback(
    ({ set, snapshot }) =>
      (event: React.MouseEvent, recordId: string) => {
        event.preventDefault();

        const tableScopeId = getScopeIdFromComponentId(recordTableId);

        set(
          extractComponentState(
            actionMenuDropdownPositionComponentState,
            `action-menu-dropdown-${recordTableId}`,
          ),
          {
            x: event.clientX,
            y: event.clientY,
          },
        );

        const isRowSelectedFamilyState = extractComponentFamilyState(
          isRowSelectedComponentFamilyState,
          tableScopeId,
        );

        const isRowSelected = getSnapshotValue(
          snapshot,
          isRowSelectedFamilyState(recordId),
        );

        if (isRowSelected !== true) {
          set(isRowSelectedFamilyState(recordId), true);
        }

        const isActionMenuDropdownOpenState = extractComponentState(
          isDropdownOpenComponentState,
          `action-menu-dropdown-${recordTableId}`,
        );

        const isActionBarOpenState = isBottomBarOpenedComponentState.atomFamily(
          {
            instanceId: `action-bar-${recordTableId}`,
          },
        );

        set(isActionBarOpenState, false);
        set(isActionMenuDropdownOpenState, true);
      },
    [recordTableId],
  );

  return { triggerActionMenuDropdown };
};
