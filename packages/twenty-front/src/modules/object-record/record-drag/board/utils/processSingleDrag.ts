import { DropResult } from '@hello-pangea/dnd';
import { calculateRecordPositions } from '@/object-record/record-drag/board/utils/calculateRecordPositions';
import { RecordPositionData } from '@/object-record/record-drag/shared/types/dragTypes';

type SingleDragContext = {
  result: DropResult;
  recordPositionData: RecordPositionData[];
  destinationRecordIds: string[];
  groupValue: string | null;
  selectFieldName: string;
};

type SingleDragResult = {
  recordId: string;
  position: number;
  groupValue: string | null;
  selectFieldName: string;
};

export const processSingleDrag = ({
  result,
  recordPositionData,
  destinationRecordIds,
  groupValue,
  selectFieldName,
}: SingleDragContext): SingleDragResult => {
  const draggedRecordId = result.draggableId;

  if (!result.destination) {
    throw new Error('Destination is required for drag operation');
  }

  const destinationIndex = result.destination.index;

  const recordsToMove = [draggedRecordId];

  const positions = calculateRecordPositions({
    destinationRecordIds,
    recordsToMove,
    destinationIndex,
    recordPositionData,
  });

  return {
    recordId: draggedRecordId,
    position: positions[draggedRecordId],
    groupValue,
    selectFieldName,
  };
};
