export const getRecordTableCellId = (
  recordTableId: string,
  column: number,
  recordId: string,
): string => {
  return `record-table-cell-${recordTableId}-${column}-${recordId}`;
};
