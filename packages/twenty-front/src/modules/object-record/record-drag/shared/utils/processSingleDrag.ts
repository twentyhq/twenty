import {
  computeNewPositionOfDraggedRecord,
  type RecordWithPosition,
} from '@/object-record/utils/computeNewPositionOfDraggedRecord';

type SingleDragContext = {
  targetRecordId: string;
  sourceRecordId: string;
  recordsWithPosition: RecordWithPosition[];
};

export const processSingleDrag = ({
  targetRecordId,
  sourceRecordId,
  recordsWithPosition,
}: SingleDragContext): RecordWithPosition => {
  const newPosition = computeNewPositionOfDraggedRecord({
    arrayOfRecordsWithPosition: recordsWithPosition,
    idOfItemToMove: sourceRecordId,
    idOfTargetItem: targetRecordId,
  });

  return {
    id: sourceRecordId,
    position: newPosition,
  };
};
