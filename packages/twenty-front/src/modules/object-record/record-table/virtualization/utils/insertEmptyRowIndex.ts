export const insertEmptyRowIndex = (
  recordIdsByRowIndex: string[],
  rowIndex: number,
): string[] => {
  const nextRecordIdsByRowIndex: string[] = [];

  recordIdsByRowIndex.forEach((recordId, currentRowIndex) => {
    nextRecordIdsByRowIndex[
      currentRowIndex < rowIndex ? currentRowIndex : currentRowIndex + 1
    ] = recordId;
  });

  return nextRecordIdsByRowIndex;
};
