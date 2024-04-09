import { useResetRecoilState } from 'recoil';

import { recordTablePendingRecordIdState } from '@/object-record/record-table/states/recordTablePendingRecordIdState';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';

import { useCloseCurrentTableCellInEditMode } from '../../hooks/internal/useCloseCurrentTableCellInEditMode';
import { TableHotkeyScope } from '../../types/TableHotkeyScope';

export const useCloseRecordTableCell = () => {
  const setHotkeyScope = useSetHotkeyScope();
  const { setDragSelectionStartEnabled } = useDragSelect();

  const closeCurrentTableCellInEditMode = useCloseCurrentTableCellInEditMode();
  const resetRecordTablePendingRecordId = useResetRecoilState(
    recordTablePendingRecordIdState,
  );

  const closeTableCell = async () => {
    setDragSelectionStartEnabled(true);
    closeCurrentTableCellInEditMode();
    setHotkeyScope(TableHotkeyScope.TableSoftFocus);
    resetRecordTablePendingRecordId();
  };

  return {
    closeTableCell,
  };
};
