import { type MultiDragResult } from '@/object-record/record-drag/types/MultiDragResult';
import { type RecordWithPosition } from '@/object-record/utils/computeNewPositionOfDraggedRecord';
import { computeNewPositionsOfDraggedRecords } from '@/object-record/utils/computeNewPositionsOfDraggedRecords';

type MultiDragContext = {
  draggedRecordId: string;
  targetRecordId: string;
  selectedRecordIds: string[];
  recordsWithPosition: RecordWithPosition[];
};

export const processMultiDrag = ({
  draggedRecordId,
  targetRecordId,
  selectedRecordIds,
  recordsWithPosition,
}: MultiDragContext): MultiDragResult => {
  const newPositionOfDraggedRecords = computeNewPositionsOfDraggedRecords({
    arrayOfRecordsWithPosition: recordsWithPosition,
    draggedRecordId,
    targetRecordId,
    sourceRecordIds: selectedRecordIds,
  });

  return {
    recordUpdates: newPositionOfDraggedRecords ?? [],
  };
};
