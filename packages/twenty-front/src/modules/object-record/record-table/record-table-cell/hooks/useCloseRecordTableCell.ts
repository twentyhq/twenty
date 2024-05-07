import { useResetRecoilState } from 'recoil';

import { SOFT_FOCUS_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-table/constants/SoftFocusClickOutsideListenerId';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';

import { useCloseCurrentTableCellInEditMode } from '../../hooks/internal/useCloseCurrentTableCellInEditMode';
import { TableHotkeyScope } from '../../types/TableHotkeyScope';

export const useCloseRecordTableCell = () => {
  const setHotkeyScope = useSetHotkeyScope();
  const { setDragSelectionStartEnabled } = useDragSelect();
  const { pendingRecordIdState } = useRecordTableStates();

  const { toggleClickOutsideListener } = useClickOutsideListener(
    SOFT_FOCUS_CLICK_OUTSIDE_LISTENER_ID,
  );

  const closeCurrentTableCellInEditMode = useCloseCurrentTableCellInEditMode();
  const resetRecordTablePendingRecordId =
    useResetRecoilState(pendingRecordIdState);

  const closeTableCell = async () => {
    toggleClickOutsideListener(true);
    setDragSelectionStartEnabled(true);
    closeCurrentTableCellInEditMode();
    setHotkeyScope(TableHotkeyScope.TableSoftFocus);
    resetRecordTablePendingRecordId();
  };

  return {
    closeTableCell,
  };
};
