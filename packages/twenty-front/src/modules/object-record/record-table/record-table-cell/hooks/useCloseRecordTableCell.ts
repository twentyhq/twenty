import { useDragSelect, useSetHotkeyScope } from 'twenty-ui';

import { useCloseCurrentTableCellInEditMode } from '../../hooks/internal/useCloseCurrentTableCellInEditMode';
import { TableHotkeyScope } from '../../types/TableHotkeyScope';

export const useCloseRecordTableCell = () => {
  const setHotkeyScope = useSetHotkeyScope();
  const { setDragSelectionStartEnabled } = useDragSelect();

  const closeCurrentTableCellInEditMode = useCloseCurrentTableCellInEditMode();

  const closeTableCell = async () => {
    setDragSelectionStartEnabled(true);
    closeCurrentTableCellInEditMode();
    setHotkeyScope(TableHotkeyScope.TableSoftFocus);
  };

  return {
    closeTableCell,
  };
};
