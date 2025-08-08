import { MultiDragResult } from '@/object-record/record-drag/shared/types/MultiDragResult';
import { RecordDragPositionData } from '@/object-record/record-drag/shared/types/RecordDragPositionData';
import { calculateDragPositions } from '@/object-record/record-drag/shared/utils/calculateDragPositions';
import { DropResult } from '@hello-pangea/dnd';
import { isDefined } from 'twenty-shared/utils';

type MultiDragContext = {
  result: DropResult;
  selectedRecordIds: string[];
  recordPositionData: RecordDragPositionData[];
  recordIds: string[];
  groupValue?: string | null;
  selectFieldName?: string;
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

  const positions = calculateDragPositions({
    recordIds,
    recordsToMove: selectedRecordIds,
    destinationIndex,
    recordPositionData,
  });

  const recordUpdates = selectedRecordIds.map((recordId) => {
    const baseUpdate = {
      recordId,
      position: positions[recordId],
    };

    if (isDefined(groupValue) && isDefined(selectFieldName)) {
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
