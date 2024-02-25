import { useRecoilCallback } from 'recoil';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { currentHotkeyScopeState } from '@/ui/utilities/hotkey/states/internal/currentHotkeyScopeState';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

import { TableHotkeyScope } from '../../types/TableHotkeyScope';

import { useCloseCurrentTableCellInEditMode } from './useCloseCurrentTableCellInEditMode';
import { useDisableSoftFocus } from './useDisableSoftFocus';

export const useLeaveTableFocus = (recordTableId?: string) => {
  const disableSoftFocus = useDisableSoftFocus(recordTableId);
  const closeCurrentCellInEditMode =
    useCloseCurrentTableCellInEditMode(recordTableId);

  const { getIsSoftFocusActiveState } = useRecordTableStates(recordTableId);

  return useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const isSoftFocusActive = getSnapshotValue(
          snapshot,
          getIsSoftFocusActiveState(),
        );

        const currentHotkeyScope = snapshot
          .getLoadable(currentHotkeyScopeState)
          .valueOrThrow();

        if (!isSoftFocusActive) {
          return;
        }

        if (currentHotkeyScope?.scope === TableHotkeyScope.Table) {
          return;
        }

        closeCurrentCellInEditMode();
        disableSoftFocus();
      },
    [closeCurrentCellInEditMode, disableSoftFocus, getIsSoftFocusActiveState],
  );
};
