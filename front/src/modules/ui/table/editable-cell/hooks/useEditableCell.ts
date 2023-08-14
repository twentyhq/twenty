import { useContext } from 'react';

import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { useCloseCurrentCellInEditMode } from '../../hooks/useClearCellInEditMode';
import { CellHotkeyScopeContext } from '../../states/CellHotkeyScopeContext';
import { TableHotkeyScope } from '../../types/TableHotkeyScope';

import { useCurrentCellEditMode } from './useCurrentCellEditMode';

const DEFAULT_CELL_SCOPE: HotkeyScope = {
  scope: TableHotkeyScope.CellEditMode,
};

export function useEditableCell() {
  const { setCurrentCellInEditMode } = useCurrentCellEditMode();

  const setHotkeyScope = useSetHotkeyScope();
  const { setDragSelectionStartEnabled } = useDragSelect();

  const closeCurrentCellInEditMode = useCloseCurrentCellInEditMode();

  const customCellHotkeyScope = useContext(CellHotkeyScopeContext);

  function closeEditableCell() {
    setDragSelectionStartEnabled(true);
    closeCurrentCellInEditMode();
    setHotkeyScope(TableHotkeyScope.TableSoftFocus);
  }

  function openEditableCell() {
    setDragSelectionStartEnabled(false);
    setCurrentCellInEditMode();

    if (customCellHotkeyScope) {
      setHotkeyScope(
        customCellHotkeyScope.scope,
        customCellHotkeyScope.customScopes,
      );
    } else {
      setHotkeyScope(DEFAULT_CELL_SCOPE.scope, DEFAULT_CELL_SCOPE.customScopes);
    }
  }

  return {
    closeEditableCell,
    openEditableCell,
  };
}
