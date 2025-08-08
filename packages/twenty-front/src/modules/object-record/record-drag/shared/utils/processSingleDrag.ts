import { RecordPositionData } from '@/object-record/record-drag/shared/types/dragTypes';
import { calculateDragPositions } from '@/object-record/record-drag/shared/utils/calculateDragPositions';
import { DropResult } from '@hello-pangea/dnd';

type SingleDragContext = {
  result: DropResult;
  recordPositionData: RecordPositionData[];
  recordIds: string[];
  groupValue?: string | null;
  selectFieldName?: string;
};

type SingleDragResult = {
  recordId: string;
  position: number;
  groupValue?: string | null;
  selectFieldName?: string;
};

export const processSingleDrag = ({
  result,
  recordPositionData,
  recordIds,
  groupValue,
  selectFieldName,
}: SingleDragContext): SingleDragResult => {
  const draggedRecordId = result.draggableId;

  if (!result.destination) {
    throw new Error('Destination is required for drag operation');
  }

  const destinationIndex = result.destination.index;
  const recordsToMove = [draggedRecordId];

  const positions = calculateDragPositions({
    recordIds,
    recordsToMove,
    destinationIndex,
    recordPositionData,
  });

  const baseResult = {
    recordId: draggedRecordId,
    position: positions[draggedRecordId],
  };

  if (groupValue !== undefined && selectFieldName !== undefined) {
    return {
      ...baseResult,
      groupValue,
      selectFieldName,
    };
  }

  return baseResult;
};
