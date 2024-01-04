import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';

import { FieldContext } from '@/object-record/field/contexts/FieldContext';
import { useIsFieldEmpty } from '@/object-record/field/hooks/useIsFieldEmpty';
import { entityFieldInitialValueFamilyState } from '@/object-record/field/states/entityFieldInitialValueFamilyState';
import { FieldInitialValue } from '@/object-record/field/types/FieldInitialValue';
import { useRecordTableScopedStates } from '@/object-record/record-table/hooks/internal/useRecordTableScopedStates';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { getRecordTableScopeInjector } from '@/object-record/record-table/utils/getRecordTableScopeInjector';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { CellHotkeyScopeContext } from '../../contexts/CellHotkeyScopeContext';
import { ColumnIndexContext } from '../../contexts/ColumnIndexContext';
import { useCloseCurrentTableCellInEditMode } from '../../hooks/internal/useCloseCurrentTableCellInEditMode';
import { TableHotkeyScope } from '../../types/TableHotkeyScope';

import { useCurrentTableCellEditMode } from './useCurrentTableCellEditMode';

const DEFAULT_CELL_SCOPE: HotkeyScope = {
  scope: TableHotkeyScope.CellEditMode,
};

export const useTableCell = () => {
  const { scopeId: recordTableScopeId } = useRecordTable();

  const { objectMetadataConfigScopeInjector } = getRecordTableScopeInjector();

  const { injectStateWithRecordTableScopeId } = useRecordTableScopedStates();

  const objectMetadataConfig = useRecoilValue(
    injectStateWithRecordTableScopeId(objectMetadataConfigScopeInjector),
  );

  const basePathToShowPage = objectMetadataConfig?.basePathToShowPage;

  const { setCurrentTableCellInEditMode } = useCurrentTableCellEditMode();
  const setHotkeyScope = useSetHotkeyScope();
  const { setDragSelectionStartEnabled } = useDragSelect();

  const closeCurrentTableCellInEditMode =
    useCloseCurrentTableCellInEditMode(recordTableScopeId);

  const customCellHotkeyScope = useContext(CellHotkeyScopeContext);

  const navigate = useNavigate();

  const isFirstColumnCell = useContext(ColumnIndexContext) === 0;

  const isEmpty = useIsFieldEmpty();

  const { entityId, fieldDefinition } = useContext(FieldContext);

  const [, setFieldInitialValue] = useRecoilState(
    entityFieldInitialValueFamilyState({
      entityId,
      fieldMetadataId: fieldDefinition.fieldMetadataId,
    }),
  );

  const openTableCell = (options?: { initialValue?: FieldInitialValue }) => {
    if (isFirstColumnCell && !isEmpty && basePathToShowPage) {
      navigate(`${basePathToShowPage}${entityId}`);
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

  const closeTableCell = () => {
    setDragSelectionStartEnabled(true);
    closeCurrentTableCellInEditMode();
    setFieldInitialValue(undefined);
    setHotkeyScope(TableHotkeyScope.TableSoftFocus);
  };

  return {
    closeTableCell,
    openTableCell,
  };
};
