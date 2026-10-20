export const placeRecordIdsAtRowIndexes = ({
  recordIdsByRowIndex,
  recordIds,
  startingRowIndex,
}: {
  recordIdsByRowIndex: string[];
  recordIds: string[];
  startingRowIndex: number;
}): string[] => {
  const placedRecordIds = new Set(recordIds);
  const nextRecordIdsByRowIndex: string[] = [];

  recordIdsByRowIndex.forEach((recordId, rowIndex) => {
    if (!placedRecordIds.has(recordId)) {
      nextRecordIdsByRowIndex[rowIndex] = recordId;
    }
  });

  recordIds.forEach((recordId, offset) => {
    nextRecordIdsByRowIndex[startingRowIndex + offset] = recordId;
  });

  return nextRecordIdsByRowIndex;
};
