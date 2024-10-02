import { useRecoilCallback } from 'recoil';

import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { actionMenuDropdownIsOpenState } from '@/ui/navigation/action-menu/states/actionMenuDropdownIsOpenState';
import { actionMenuDropdownPositionState } from '@/ui/navigation/action-menu/states/actionMenuDropdownPositionState';
import { getScopeIdFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdFromComponentId';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { extractComponentFamilyState } from '@/ui/utilities/state/component-state/utils/extractComponentFamilyState';

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

        set(actionMenuDropdownPositionState, {
          x: event.clientX,
          y: event.clientY,
        });
        set(actionMenuDropdownIsOpenState, true);

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
      },
    [recordTableId],
  );

  return { triggerActionMenuDropdown };
};
