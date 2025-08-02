import { DropResult } from '@hello-pangea/dnd';
import {
    calculateTableRowPositions,
    RecordPositionData,
} from './calculateTableRowPositions';

type MultiTableDragContext = {
  result: DropResult;
  selectedRecordIds: string[];
  recordPositionData: RecordPositionData[];
  allRecordIds: string[];
};

type MultiTableDragResult = {
  recordUpdates: Array<{
    recordId: string;
    position: number;
  }>;
};

export const processMultiTableDrag = ({
  result,
  selectedRecordIds,
  recordPositionData,
  allRecordIds,
}: MultiTableDragContext): MultiTableDragResult => {
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
