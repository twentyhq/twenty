import { type RecordDragPositionData } from '@/object-record/record-drag/shared/types/RecordDragPositionData';
import { type RecordDragUpdate } from '@/object-record/record-drag/shared/types/RecordDragUpdate';
import { calculateDragPositions } from '@/object-record/record-drag/shared/utils/calculateDragPositions';
import { type DropResult } from '@hello-pangea/dnd';
import { isNull } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

type SingleDragContext = {
  result: DropResult;
  recordPositionData: RecordDragPositionData[];
  recordIds: string[];
  groupValue?: string | null;
  selectFieldName?: string;
};

export const processSingleDrag = ({
  result,
  recordPositionData,
  recordIds,
  groupValue,
  selectFieldName,
}: SingleDragContext): RecordDragUpdate => {
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

  const shouldIncludeGroupFields =
    isDefined(selectFieldName) && (isDefined(groupValue) || isNull(groupValue));

  if (shouldIncludeGroupFields) {
    return {
      ...baseResult,
      groupValue,
      selectFieldName,
    };
  }

  return baseResult;
};
