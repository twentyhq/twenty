import { DropResult } from '@hello-pangea/dnd';
import {
  calculateRecordPositions,
  RecordPositionData,
} from './calculateRecordPositions';

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

export const processSingleDrag = (
  context: SingleDragContext,
): SingleDragResult => {
  const {
    result,
    recordPositionData,
    destinationRecordIds,
    groupValue,
    selectFieldName,
  } = context;

  const draggedRecordId = result.draggableId;
  const sourceGroupId = result.source.droppableId;

  if (!result.destination) {
    throw new Error('Destination is required for drag operation');
  }

  const destinationGroupId = result.destination.droppableId;
  const destinationIndex = result.destination.index;

  const recordsToMove = [draggedRecordId];

  const positions = calculateRecordPositions({
    destinationRecordIds,
    recordsToMove,
    destinationIndex,
    sourceGroupId,
    destinationGroupId,
    recordPositionData,
  });

  return {
    recordId: draggedRecordId,
    position: positions[draggedRecordId],
    groupValue,
    selectFieldName,
  };
};
