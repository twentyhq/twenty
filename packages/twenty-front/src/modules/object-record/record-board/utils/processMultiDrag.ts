import { DropResult } from '@hello-pangea/dnd';
import {
  calculateRecordPositions,
  RecordPositionData,
} from './calculateRecordPositions';

type MultiDragContext = {
  result: DropResult;
  selectedRecordIds: string[];
  recordPositionData: RecordPositionData[];
  destinationRecordIds: string[];
  groupValue: string | null;
  selectFieldName: string;
};

type MultiDragResult = {
  recordUpdates: Array<{
    recordId: string;
    position: number;
    groupValue: string | null;
    selectFieldName: string;
  }>;
};

export const processMultiDrag = ({
  result,
  selectedRecordIds,
  recordPositionData,
  destinationRecordIds,
  groupValue,
  selectFieldName,
}: MultiDragContext): MultiDragResult => {
  if (!result.destination) {
    throw new Error('Destination is required for drag operation');
  }

  const destinationIndex = result.destination.index;

  const recordsToMove = selectedRecordIds;

  const positions = calculateRecordPositions({
    destinationRecordIds,
    recordsToMove,
    destinationIndex,
    recordPositionData,
  });

  const recordUpdates = recordsToMove.map((recordId) => ({
    recordId,
    position: positions[recordId],
    groupValue,
    selectFieldName,
  }));

  return {
    recordUpdates,
  };
};
