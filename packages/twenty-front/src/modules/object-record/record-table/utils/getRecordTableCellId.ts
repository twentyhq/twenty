export const getRecordTableCellId = (
  recordTableId: string,
  column: number,
  row: number,
): string => {
  return `record-table-cell-${recordTableId}-${column}-${row}`;
};
