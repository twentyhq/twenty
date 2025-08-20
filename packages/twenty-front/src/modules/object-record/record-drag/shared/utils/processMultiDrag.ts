import { type MultiDragResult } from '@/object-record/record-drag/shared/types/MultiDragResult';
import { type RecordDragPositionData } from '@/object-record/record-drag/shared/types/RecordDragPositionData';
import { calculateDragPositions } from '@/object-record/record-drag/shared/utils/calculateDragPositions';
import { type DropResult } from '@hello-pangea/dnd';
import { isNull } from '@sniptt/guards';
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

    const shouldIncludeGroupFields =
      isDefined(selectFieldName) &&
      (isDefined(groupValue) || isNull(groupValue));

    if (shouldIncludeGroupFields) {
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
