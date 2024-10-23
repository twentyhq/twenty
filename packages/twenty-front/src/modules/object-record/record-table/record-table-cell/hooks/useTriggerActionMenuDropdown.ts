import { useRecoilCallback } from 'recoil';

import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { recordIndexActionMenuDropdownPositionComponentState } from '@/action-menu/states/recordIndexActionMenuDropdownPositionComponentState';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { isBottomBarOpenedComponentState } from '@/ui/layout/bottom-bar/states/isBottomBarOpenedComponentState';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { getScopeIdFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdFromComponentId';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { extractComponentFamilyState } from '@/ui/utilities/state/component-state/utils/extractComponentFamilyState';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';

export const useTriggerActionMenuDropdown = ({
  recordTableId,
}: {
  recordTableId: string;
}) => {
  const actionMenuInstanceId = useAvailableComponentInstanceIdOrThrow(
    ActionMenuComponentInstanceContext,
  );

  const triggerActionMenuDropdown = useRecoilCallback(
    ({ set, snapshot }) =>
      (event: React.MouseEvent, recordId: string) => {
        event.preventDefault();

        const tableScopeId = getScopeIdFromComponentId(recordTableId);

        set(
          extractComponentState(
            recordIndexActionMenuDropdownPositionComponentState,
            `action-menu-dropdown-${actionMenuInstanceId}`,
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
          `action-menu-dropdown-${actionMenuInstanceId}`,
        );

        const isActionBarOpenState = isBottomBarOpenedComponentState.atomFamily(
          {
            instanceId: `action-bar-${actionMenuInstanceId}`,
          },
        );

        set(isActionBarOpenState, false);
        set(isActionMenuDropdownOpenState, true);
      },
    [actionMenuInstanceId, recordTableId],
  );

  return { triggerActionMenuDropdown };
};
