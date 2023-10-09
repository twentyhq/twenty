import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { FieldContext } from '@/ui/field/contexts/FieldContext';
import { useIsFieldEmpty } from '@/ui/field/hooks/useIsFieldEmpty';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { CellHotkeyScopeContext } from '../../contexts/CellHotkeyScopeContext';
import { ColumnIndexContext } from '../../contexts/ColumnIndexContext';
import { useCloseCurrentTableCellInEditMode } from '../../hooks/useCloseCurrentTableCellInEditMode';
import { useSomeCellInEditMode } from '../../hooks/useSomeCellInEditMode';
import { TableHotkeyScope } from '../../types/TableHotkeyScope';

import { useCurrentTableCellEditMode } from './useCurrentTableCellEditMode';

const DEFAULT_CELL_SCOPE: HotkeyScope = {
  scope: TableHotkeyScope.CellEditMode,
};

export const useTableCell = () => {
  const { setCurrentTableCellInEditMode } = useCurrentTableCellEditMode();
  const { setIsSomeCellInEditMode } = useSomeCellInEditMode();

  const setHotkeyScope = useSetHotkeyScope();
  const { setDragSelectionStartEnabled } = useDragSelect();

  const closeCurrentTableCellInEditMode = useCloseCurrentTableCellInEditMode();
  const customCellHotkeyScope = useContext(CellHotkeyScopeContext);

  const closeTableCell = () => {
    setDragSelectionStartEnabled(true);
    closeCurrentTableCellInEditMode();
    setIsSomeCellInEditMode(false);
    setHotkeyScope(TableHotkeyScope.TableSoftFocus);
  };

  const navigate = useNavigate();

  const isFirstColumnCell = useContext(ColumnIndexContext) === 0;

  const isEmpty = useIsFieldEmpty();

  const { entityId, fieldDefinition } = useContext(FieldContext);

  const openTableCell = () => {
    if (isFirstColumnCell && !isEmpty && fieldDefinition.basePathToShowPage) {
      navigate(`${fieldDefinition.basePathToShowPage}${entityId}`);
      return;
    }
    setDragSelectionStartEnabled(false);
    setIsSomeCellInEditMode(true);
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
