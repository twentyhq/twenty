export const getRecordTableRowFocusId = ({
  recordTableId,
  rowIndex,
}: {
  recordTableId: string;
  rowIndex: number;
}) => {
  return `${recordTableId}-row-${rowIndex}`;
};
