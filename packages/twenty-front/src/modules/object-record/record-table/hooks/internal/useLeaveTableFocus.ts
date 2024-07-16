import { useRecoilCallback } from 'recoil';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { currentHotkeyScopeState } from '@/ui/utilities/hotkey/states/internal/currentHotkeyScopeState';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

import { TableHotkeyScope } from '../../types/TableHotkeyScope';

import { useCloseCurrentTableCellInEditMode } from './useCloseCurrentTableCellInEditMode';
import { useDisableSoftFocus } from './useDisableSoftFocus';
import { useSetHasUserSelectedAllRows } from './useSetAllRowSelectedState';

export const useLeaveTableFocus = (recordTableId?: string) => {
  const disableSoftFocus = useDisableSoftFocus(recordTableId);
  const closeCurrentCellInEditMode =
    useCloseCurrentTableCellInEditMode(recordTableId);

  const setHasUserSelectedAllRows = useSetHasUserSelectedAllRows(recordTableId);

  const selectAllRows = useSetHasUserSelectedAllRows(recordTableId);

  const { isSoftFocusActiveState } = useRecordTableStates(recordTableId);

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

        if (!isSoftFocusActive) {
          return;
        }

        if (currentHotkeyScope?.scope === TableHotkeyScope.Table) {
          return;
        }

        closeCurrentCellInEditMode();
        disableSoftFocus();
        setHasUserSelectedAllRows(false);
        selectAllRows(false);
      },
    [
      closeCurrentCellInEditMode,
      disableSoftFocus,
      isSoftFocusActiveState,
      selectAllRows,
      setHasUserSelectedAllRows,
    ],
  );
};
