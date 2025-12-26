import {
  computeNewPositionOfDraggedRecord,
  type RecordWithPosition,
} from '@/object-record/utils/computeNewPositionOfDraggedRecord';

type SingleDragContext = {
  targetRecordId: string;
  sourceRecordId: string;
  recordsWithPosition: RecordWithPosition[];
  isDroppedAfterList: boolean;
};

export const processSingleDrag = ({
  targetRecordId,
  sourceRecordId,
  recordsWithPosition,
  isDroppedAfterList,
}: SingleDragContext): RecordWithPosition => {
  const newPosition = computeNewPositionOfDraggedRecord({
    arrayOfRecordsWithPosition: recordsWithPosition,
    idOfItemToMove: sourceRecordId,
    idOfTargetItem: targetRecordId,
    isDroppedAfterList,
  });

  return {
    id: sourceRecordId,
    position: newPosition,
  };
};
