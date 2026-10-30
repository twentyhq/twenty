import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableCellCheckbox } from '@/object-record/record-table/record-table-cell/components/RecordTableCellCheckbox';
import { RecordTableCellDragAndDrop } from '@/object-record/record-table/record-table-cell/components/RecordTableCellDragAndDrop';
import { RecordTableLastEmptyCell } from '@/object-record/record-table/record-table-cell/components/RecordTableLastEmptyCell';
import { RecordTablePlusButtonCellPlaceholder } from '@/object-record/record-table/record-table-cell/components/RecordTablePlusButtonCellPlaceholder';
import { RecordTableFieldsCells } from '@/object-record/record-table/record-table-row/components/RecordTableFieldsCells';
import { RecordTableRowFocusEffects } from '@/object-record/record-table/record-table-row/components/RecordTableRowFocusEffects';
import { useIsRecordTableCheckboxColumnHidden } from '@/object-record/record-table/hooks/useIsRecordTableCheckboxColumnHidden';
import { isRecordTableDragColumnHiddenComponentState } from '@/object-record/record-table/states/isRecordTableDragColumnHiddenComponentState';
import { isRecordTableRowFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableRowFocusActiveComponentState';
import { isRecordTableRowFocusedByRecordIdComponentFamilySelector } from '@/object-record/record-table/states/selectors/isRecordTableRowFocusedByRecordIdComponentFamilySelector';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const RecordTableRowCells = () => {
  const { recordTableId } = useRecordTableContextOrThrow();
  const { recordId } = useRecordTableRowContextOrThrow();

  const isRecordTableRowFocused = useAtomComponentFamilySelectorValue(
    isRecordTableRowFocusedByRecordIdComponentFamilySelector,
    recordId,
  );

  const isRecordTableRowFocusActive = useAtomComponentStateValue(
    isRecordTableRowFocusActiveComponentState,
    recordTableId,
  );

  const isRecordTableDragColumnHidden = useAtomComponentStateValue(
    isRecordTableDragColumnHiddenComponentState,
  );

  const isRecordTableCheckboxColumnHidden =
    useIsRecordTableCheckboxColumnHidden();

  return (
    <>
      {isRecordTableRowFocusActive && isRecordTableRowFocused && (
        <RecordTableRowFocusEffects />
      )}
      {!isRecordTableDragColumnHidden && <RecordTableCellDragAndDrop />}
      {!isRecordTableCheckboxColumnHidden && <RecordTableCellCheckbox />}
      <RecordTableFieldsCells />
      <RecordTablePlusButtonCellPlaceholder />
      <RecordTableLastEmptyCell />
    </>
  );
};
