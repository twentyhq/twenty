import { useRecoilCallback } from 'recoil';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { useDisableSoftFocus } from './useDisableSoftFocus';

export const useLeaveTableFocus = (recordTableId?: string) => {
  const disableSoftFocus = useDisableSoftFocus(recordTableId);

  const { isSoftFocusActiveState } = useRecordTableStates(recordTableId);

  const resetTableRowSelection = useResetTableRowSelection(recordTableId);

  return useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const isSoftFocusActive = getSnapshotValue(
          snapshot,
          isSoftFocusActiveState,
        );

        resetTableRowSelection();

        if (!isSoftFocusActive) {
          return;
        }

        disableSoftFocus();
      },
    [disableSoftFocus, isSoftFocusActiveState, resetTableRowSelection],
  );
};
