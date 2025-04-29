type getBeforeAndAfterIndexRecordIds = {
  draggedRecordIndex: number;
  otherRecordIds: string[];
};
type getBeforeAndAfterIndexRecordIdsReturnType = {
  recordBeforeId?: string;
  recordAfterId?: string;
};
export const getBeforeAndAfterIndexRecordIds = ({
  draggedRecordIndex,
  otherRecordIds,
}: getBeforeAndAfterIndexRecordIds): getBeforeAndAfterIndexRecordIdsReturnType => {
  if (draggedRecordIndex === 0) {
    return {
      recordAfterId: otherRecordIds.at(0),
    };
  }

  if (draggedRecordIndex >= otherRecordIds.length) {
    return {
      recordBeforeId: otherRecordIds.at(-1),
    };
  }

  return {
    recordBeforeId: otherRecordIds.at(draggedRecordIndex - 1),
    recordAfterId: otherRecordIds.at(draggedRecordIndex),
  };
};
