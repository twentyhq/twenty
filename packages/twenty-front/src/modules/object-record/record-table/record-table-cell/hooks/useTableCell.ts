import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilCallback, useRecoilState, useRecoilValue } from 'recoil';

import { FieldContext } from '@/object-record/field/contexts/FieldContext';
import { useIsFieldEditModeValueEmpty } from '@/object-record/field/hooks/useIsFieldEditModeValueEmpty';
import { useIsFieldEmpty } from '@/object-record/field/hooks/useIsFieldEmpty';
import { entityFieldInitialValueFamilyState } from '@/object-record/field/states/entityFieldInitialValueFamilyState';
import { FieldInitialValue } from '@/object-record/field/types/FieldInitialValue';
import { EntityDeleteContext } from '@/object-record/record-table/contexts/EntityDeleteHookContext';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

import { CellHotkeyScopeContext } from '../../contexts/CellHotkeyScopeContext';
import { ColumnIndexContext } from '../../contexts/ColumnIndexContext';
import { useCloseCurrentTableCellInEditMode } from '../../hooks/internal/useCloseCurrentTableCellInEditMode';
import { TableHotkeyScope } from '../../types/TableHotkeyScope';

import { useCurrentTableCellEditMode } from './useCurrentTableCellEditMode';

export const DEFAULT_CELL_SCOPE: HotkeyScope = {
  scope: TableHotkeyScope.CellEditMode,
};

export const useTableCell = () => {
  const { getObjectMetadataConfigState, getTableRowIdsState } =
    useRecordTableStates();

  const { leaveTableFocus } = useRecordTable();

  const objectMetadataConfig = useRecoilValue(getObjectMetadataConfigState());

  const basePathToShowPage = objectMetadataConfig?.basePathToShowPage;

  const { setCurrentTableCellInEditMode } = useCurrentTableCellEditMode();
  const setHotkeyScope = useSetHotkeyScope();
  const { setDragSelectionStartEnabled } = useDragSelect();

  const closeCurrentTableCellInEditMode = useCloseCurrentTableCellInEditMode();

  const customCellHotkeyScope = useContext(CellHotkeyScopeContext);

  const navigate = useNavigate();

  const isFirstColumnCell = useContext(ColumnIndexContext) === 0;

  const isEmpty = useIsFieldEmpty();
  const isEditModeValueEmpty = useIsFieldEditModeValueEmpty();

  const { entityId, fieldDefinition } = useContext(FieldContext);

  const deleteOneRecord = useContext(EntityDeleteContext);

  const [, setFieldInitialValue] = useRecoilState(
    entityFieldInitialValueFamilyState({
      entityId,
      fieldMetadataId: fieldDefinition.fieldMetadataId,
    }),
  );

  const deleteRow = useRecoilCallback(({ snapshot }) => async () => {
    const tableRowIds = getSnapshotValue(snapshot, getTableRowIdsState());

    await deleteOneRecord(tableRowIds[0]);
  });

  const openTableCell = (options?: { initialValue?: FieldInitialValue }) => {
    if (isFirstColumnCell && !isEmpty && basePathToShowPage) {
      leaveTableFocus();
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

  const closeTableCell = async () => {
    setDragSelectionStartEnabled(true);
    closeCurrentTableCellInEditMode();
    setFieldInitialValue(undefined);
    setHotkeyScope(TableHotkeyScope.TableSoftFocus);

    if (isFirstColumnCell && isEditModeValueEmpty) {
      await deleteRow();
    }
  };

  return {
    closeTableCell,
    openTableCell,
  };
};
