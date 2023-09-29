import { useContext } from 'react';

import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { CellHotkeyScopeContext } from '../../contexts/CellHotkeyScopeContext';
import { useCloseCurrentTableCellInEditMode } from '../../hooks/useCloseCurrentTableCellInEditMode';
import { TableHotkeyScope } from '../../types/TableHotkeyScope';

import { useCurrentTableCellEditMode } from './useCurrentTableCellEditMode';

const DEFAULT_CELL_SCOPE: HotkeyScope = {
  scope: TableHotkeyScope.CellEditMode,
};

export const useTableCell = () => {
  const { setCurrentTableCellInEditMode } = useCurrentTableCellEditMode();

  const setHotkeyScope = useSetHotkeyScope();
  const { setDragSelectionStartEnabled } = useDragSelect();

  const closeCurrentTableCellInEditMode = useCloseCurrentTableCellInEditMode();

  const customCellHotkeyScope = useContext(CellHotkeyScopeContext);

  const closeTableCell = () => {
    setDragSelectionStartEnabled(true);
    closeCurrentTableCellInEditMode();
    setHotkeyScope(TableHotkeyScope.TableSoftFocus);
  };

  const openTableCell = () => {
    setDragSelectionStartEnabled(false);
    setCurrentTableCellInEditMode();

    if (customCellHotkeyScope) {
      setHotkeyScope(
        customCellHotkeyScope.scope,
        customCellHotkeyScope.customScopes,
      );
    } else {
      setHotkeyScope(DEFAULT_CELL_SCOPE.scope, DEFAULT_CELL_SCOPE.customScopes);
    }
  };

  return {
    closeTableCell,
    openTableCell,
  };
};
