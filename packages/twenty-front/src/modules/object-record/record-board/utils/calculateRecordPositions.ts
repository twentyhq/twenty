import { getDraggedRecordPosition } from '@/object-record/record-board/utils/getDraggedRecordPosition';
import { getIndexNeighboursElementsFromArray } from '~/utils/array/getIndexNeighboursElementsFromArray';

export type RecordPositionData = {
  recordId: string;
  position?: number;
};

type PositionCalculationContext = {
  destinationRecordIds: string[];
  recordsToMove: string[];
  destinationIndex: number;
  recordPositionData: RecordPositionData[];
};

export const calculateRecordPositions = ({
  destinationRecordIds,
  recordsToMove,
  destinationIndex,
  recordPositionData,
}: PositionCalculationContext): Record<string, number> => {
  const otherRecordIdsInDestinationColumn = destinationRecordIds.filter(
    (recordId: string) => !recordsToMove.includes(recordId),
  );

  const filteredRecordIds =
    recordsToMove.length === 1
      ? otherRecordIdsInDestinationColumn
      : destinationRecordIds.filter(
          (recordId) => recordId !== recordsToMove[0],
        );

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
