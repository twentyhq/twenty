import { type RecordDragPositionData } from '@/object-record/record-drag/shared/types/RecordDragPositionData';
import { getDraggedRecordPosition } from '@/object-record/record-drag/shared/utils/getDraggedRecordPosition';
import { getIndexNeighboursElementsFromArray } from '~/utils/array/getIndexNeighboursElementsFromArray';

type DragPositionCalculationParams = {
  recordIds: string[];
  recordsToMove: string[];
  destinationIndex: number;
  recordPositionData: RecordDragPositionData[];
};

export const calculateDragPositions = ({
  recordIds,
  recordsToMove,
  destinationIndex,
  recordPositionData,
}: DragPositionCalculationParams): Record<string, number> => {
  const otherRecordIds = recordIds.filter(
    (recordId: string) => !recordsToMove.includes(recordId),
  );

  const filteredRecordIds =
    recordsToMove.length === 1
      ? otherRecordIds
      : recordIds.filter((recordId) => recordId !== recordsToMove[0]);

  const { before: recordBeforeId, after: recordAfterId } =
    getIndexNeighboursElementsFromArray({
      index: destinationIndex,
      array: filteredRecordIds,
    });

  const recordBefore = recordBeforeId
    ? recordPositionData.find((r) => r.recordId === recordBeforeId)
    : null;

  const recordAfter = recordAfterId
    ? recordPositionData.find((r) => r.recordId === recordAfterId)
    : null;

  const basePosition = getDraggedRecordPosition(
    recordBefore?.position,
    recordAfter?.position,
  );

  const positions: Record<string, number> = {};

  for (const [index, recordId] of recordsToMove.entries()) {
    if (recordsToMove.length > 1) {
      const availableSpace = recordAfter?.position
        ? recordAfter.position - basePosition
        : 1;

      const increment = availableSpace / (recordsToMove.length + 1);
      positions[recordId] = basePosition + (index + 1) * increment;
    } else {
      positions[recordId] = basePosition;
    }
  }

  return positions;
};
