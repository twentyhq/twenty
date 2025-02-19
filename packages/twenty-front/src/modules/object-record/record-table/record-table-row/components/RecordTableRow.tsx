import { RecordValueSetterEffect } from '@/object-record/record-store/components/RecordValueSetterEffect';
import { RecordTableCellCheckbox } from '@/object-record/record-table/record-table-cell/components/RecordTableCellCheckbox';
import { RecordTableCellGrip } from '@/object-record/record-table/record-table-cell/components/RecordTableCellGrip';
import { RecordTableLastEmptyCell } from '@/object-record/record-table/record-table-cell/components/RecordTableLastEmptyCell';
import { RecordTableCells } from '@/object-record/record-table/record-table-row/components/RecordTableCells';
import { RecordTableRowWrapper } from '@/object-record/record-table/record-table-row/components/RecordTableRowWrapper';

type RecordTableRowProps = {
  recordId: string;
  rowIndexForFocus: number;
  rowIndexForDrag: number;
  isPendingRow?: boolean;
};

export const RecordTableRow = ({
  recordId,
  rowIndexForFocus,
  rowIndexForDrag,
  isPendingRow,
}: RecordTableRowProps) => {
  return (
    <RecordTableRowWrapper
      recordId={recordId}
      rowIndexForFocus={rowIndexForFocus}
      rowIndexForDrag={rowIndexForDrag}
      isPendingRow={isPendingRow}
    >
      <RecordTableCellGrip />
      <RecordTableCellCheckbox />
      <RecordTableCells />
      <RecordTableLastEmptyCell />
      <RecordValueSetterEffect recordId={recordId} />
    </RecordTableRowWrapper>
  );
};
