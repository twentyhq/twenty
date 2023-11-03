import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';

import { FieldContext } from '@/ui/object/field/contexts/FieldContext';
import { useIsFieldEmpty } from '@/ui/object/field/hooks/useIsFieldEmpty';
import { entityFieldInitialValueFamilyState } from '@/ui/object/field/states/entityFieldInitialValueFamilyState';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { CellHotkeyScopeContext } from '../../contexts/CellHotkeyScopeContext';
import { ColumnIndexContext } from '../../contexts/ColumnIndexContext';
import { useCloseCurrentTableCellInEditMode } from '../../hooks/useCloseCurrentTableCellInEditMode';
import { TableCellInitialValue } from '../../types/TableCellInitialValue';
import { TableHotkeyScope } from '../../types/TableHotkeyScope';

import { useCurrentTableCellEditMode } from './useCurrentTableCellEditMode';
import { useCurrentTableCellInitialValue } from './useCurrentTableCellInitialValue';

const DEFAULT_CELL_SCOPE: HotkeyScope = {
  scope: TableHotkeyScope.CellEditMode,
};

export const useTableCell = () => {
  const { setCurrentTableCellInEditMode } = useCurrentTableCellEditMode();
  const { setCurrentTableCellInitialValue } = useCurrentTableCellInitialValue();

  const setHotkeyScope = useSetHotkeyScope();
  const { setDragSelectionStartEnabled } = useDragSelect();

  const closeCurrentTableCellInEditMode = useCloseCurrentTableCellInEditMode();

  const customCellHotkeyScope = useContext(CellHotkeyScopeContext);

  const closeTableCell = () => {
    setDragSelectionStartEnabled(true);
    closeCurrentTableCellInEditMode();
    setCurrentTableCellInitialValue(undefined);
    setHotkeyScope(TableHotkeyScope.TableSoftFocus);
  };

  const navigate = useNavigate();

  const isFirstColumnCell = useContext(ColumnIndexContext) === 0;

  const isEmpty = useIsFieldEmpty();

  const { entityId, fieldDefinition } = useContext(FieldContext);

  const [, setFieldInitialValue] = useRecoilState(
    entityFieldInitialValueFamilyState({
      entityId,
      fieldId: fieldDefinition.fieldId,
    }),
  );

  const openTableCell = (options?: {
    initialValue?: TableCellInitialValue;
  }) => {
    if (isFirstColumnCell && !isEmpty && fieldDefinition.basePathToShowPage) {
      navigate(`${fieldDefinition.basePathToShowPage}${entityId}`);
      return;
    }

    setDragSelectionStartEnabled(false);
    setCurrentTableCellInEditMode();

    if (options?.initialValue) {
      setFieldInitialValue(options.initialValue);
    }

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
