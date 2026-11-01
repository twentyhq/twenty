export const getRecordTableCellId = ({
  recordTableId,
  columnIndex,
  recordId,
}: {
  recordTableId: string;
  columnIndex: number;
  recordId: string;
}): string => `record-table-cell-${recordTableId}-${columnIndex}-${recordId}`;
