import { DropResult } from '@hello-pangea/dnd';
import { calculateTableRowPositions } from '@/object-record/record-drag/table/utils/calculateTableRowPositions';
import {
  RecordPositionData,
  MultiDragResult,
} from '@/object-record/record-drag/shared/types/dragTypes';

type MultiTableDragContext = {
  result: DropResult;
  selectedRecordIds: string[];
  recordPositionData: RecordPositionData[];
  allRecordIds: string[];
};

export const processMultiTableDrag = ({
  result,
  selectedRecordIds,
  recordPositionData,
  allRecordIds,
}: MultiTableDragContext): MultiDragResult => {
  if (!result.destination) {
    throw new Error('Destination is required for drag operation');
  }

  const destinationIndex = result.destination.index;
  const recordsToMove = selectedRecordIds;

  const positions = calculateTableRowPositions({
    allRecordIds,
    recordsToMove,
    destinationIndex,
    recordPositionData,
  });

  const recordUpdates = recordsToMove.map((recordId) => ({
    recordId,
    position: positions[recordId],
  }));

  return {
    recordUpdates,
  };
};
