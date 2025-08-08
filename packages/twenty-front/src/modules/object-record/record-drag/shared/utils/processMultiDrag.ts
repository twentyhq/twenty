import { RecordPositionData } from '@/object-record/record-drag/shared/types/dragTypes';
import { calculateDragPositions } from '@/object-record/record-drag/shared/utils/calculateDragPositions';
import { DropResult } from '@hello-pangea/dnd';

type MultiDragContext = {
  result: DropResult;
  selectedRecordIds: string[];
  recordPositionData: RecordPositionData[];
  recordIds: string[];
  groupValue?: string | null;
  selectFieldName?: string;
};

type RecordUpdate = {
  recordId: string;
  position: number;
  groupValue?: string | null;
  selectFieldName?: string;
};

type MultiDragResult = {
  recordUpdates: RecordUpdate[];
};

export const processMultiDrag = ({
  result,
  selectedRecordIds,
  recordPositionData,
  recordIds,
  groupValue,
  selectFieldName,
}: MultiDragContext): MultiDragResult => {
  if (!result.destination) {
    throw new Error('Destination is required for drag operation');
  }

  const destinationIndex = result.destination.index;
  const recordsToMove = selectedRecordIds;

  const positions = calculateDragPositions({
    recordIds,
    recordsToMove,
    destinationIndex,
    recordPositionData,
  });

  const recordUpdates = recordsToMove.map((recordId) => {
    const baseUpdate = {
      recordId,
      position: positions[recordId],
    };

    if (groupValue !== undefined && selectFieldName !== undefined) {
      return {
        ...baseUpdate,
        groupValue,
        selectFieldName,
      };
    }

    return baseUpdate;
  });

  return {
    recordUpdates,
  };
};
