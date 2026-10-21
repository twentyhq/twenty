export const keepRecordIdsInRowIndexRange = ({
  recordIdsByRowIndex,
  firstRowIndex,
  lastRowIndex,
}: {
  recordIdsByRowIndex: string[];
  firstRowIndex: number;
  lastRowIndex: number;
}): string[] => {
  const recordIdsInRange: string[] = [];

  recordIdsByRowIndex.forEach((recordId, rowIndex) => {
    if (rowIndex >= firstRowIndex && rowIndex <= lastRowIndex) {
      recordIdsInRange[rowIndex] = recordId;
    }
  });

  return recordIdsInRange;
};
