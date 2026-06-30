import { type MultiDragResult } from '@/object-record/record-drag/types/MultiDragResult';
import { type RecordWithPosition } from '@/object-record/utils/computeNewPositionOfDraggedRecord';
import { computeNewPositionsOfDraggedRecords } from '@/object-record/utils/computeNewPositionsOfDraggedRecords';

type MultiDragContext = {
  draggedRecordId: string;
  targetRecordId: string;
  selectedRecordIds: string[];
  recordsWithPosition: RecordWithPosition[];
  isDroppedAfterList: boolean;
};

export const processMultiDrag = ({
  draggedRecordId,
  targetRecordId,
  selectedRecordIds,
  recordsWithPosition,
  isDroppedAfterList,
}: MultiDragContext): MultiDragResult => {
  const newPositionOfDraggedRecords = computeNewPositionsOfDraggedRecords({
    arrayOfRecordsWithPosition: recordsWithPosition,
    draggedRecordId,
    targetRecordId,
    sourceRecordIds: selectedRecordIds,
    isDroppedAfterList,
  });

  return {
    recordUpdates: newPositionOfDraggedRecords ?? [],
  };
};
