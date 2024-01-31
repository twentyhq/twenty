import { useContext } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useRecordFieldInput } from '@/object-record/record-field/hooks/useRecordFieldInput';
import { EntityDeleteContext } from '@/object-record/record-table/contexts/EntityDeleteHookContext';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

import { useCloseCurrentTableCellInEditMode } from '../../hooks/internal/useCloseCurrentTableCellInEditMode';
import { TableHotkeyScope } from '../../types/TableHotkeyScope';

export const useCloseRecordTableCell = () => {
  const { getTableRowIdsState } = useRecordTableStates();
  const { columnIndex } = useContext(RecordTableCellContext);
  const { entityId, fieldDefinition } = useContext(FieldContext);
  const deleteOneRecord = useContext(EntityDeleteContext);

  const setHotkeyScope = useSetHotkeyScope();
  const { setDragSelectionStartEnabled } = useDragSelect();

  const closeCurrentTableCellInEditMode = useCloseCurrentTableCellInEditMode();

  const {
    getDraftValueSelector: getFieldInputDraftValueSelector,
    isDraftValueEmpty: isCurrentFieldInputValueEmpty,
  } = useRecordFieldInput(
    `${entityId}-${fieldDefinition?.metadata?.fieldName}`,
  );

  const currentFieldInputDraftValue = useRecoilValue(
    getFieldInputDraftValueSelector(),
  );

  const isFirstColumnCell = columnIndex === 0;

  const deleteRow = useRecoilCallback(({ snapshot }) => async () => {
    const tableRowIds = getSnapshotValue(snapshot, getTableRowIdsState());

    await deleteOneRecord(tableRowIds[0]);
  });

  const closeTableCell = async () => {
    setDragSelectionStartEnabled(true);
    closeCurrentTableCellInEditMode();
    setHotkeyScope(TableHotkeyScope.TableSoftFocus);

    if (
      isFirstColumnCell &&
      isCurrentFieldInputValueEmpty(currentFieldInputDraftValue)
    ) {
      await deleteRow();
    }
  };

  return {
    closeTableCell,
  };
};
