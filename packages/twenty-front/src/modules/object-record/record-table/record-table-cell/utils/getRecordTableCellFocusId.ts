import { type TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';

export const getRecordTableCellFocusId = ({
  recordTableId,
  cellPosition,
}: {
  recordTableId: string;
  cellPosition: TableCellPosition;
}) => {
  return `${recordTableId}-cell-${cellPosition.row}-${cellPosition.column}`;
};
