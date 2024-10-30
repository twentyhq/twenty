import { useRecoilCallback } from 'recoil';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { currentHotkeyScopeState } from '@/ui/utilities/hotkey/states/internal/currentHotkeyScopeState';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

import { TableHotkeyScope } from '../../types/TableHotkeyScope';

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

        const currentHotkeyScope = snapshot
          .getLoadable(currentHotkeyScopeState)
          .getValue();

        resetTableRowSelection();

        if (!isSoftFocusActive) {
          return;
        }

        if (currentHotkeyScope?.scope === TableHotkeyScope.Table) {
          return;
        }

        disableSoftFocus();
      },
    [disableSoftFocus, isSoftFocusActiveState, resetTableRowSelection],
  );
};
