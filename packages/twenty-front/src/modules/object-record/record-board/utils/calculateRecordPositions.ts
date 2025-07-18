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
  sourceGroupId: string;
  destinationGroupId: string;
  recordPositionData: RecordPositionData[];
};

export const calculateRecordPositions = (
  context: PositionCalculationContext,
): Record<string, number> => {
  const {
    destinationRecordIds,
    recordsToMove,
    destinationIndex,
    sourceGroupId,
    destinationGroupId,
    recordPositionData,
  } = context;

  const otherRecordIdsInDestinationColumn = destinationRecordIds.filter(
    (recordId: string) => !recordsToMove.includes(recordId),
  );

  const filteredRecordIds =
    sourceGroupId === destinationGroupId && recordsToMove.length === 1
      ? otherRecordIdsInDestinationColumn.filter(
          (recordId) => recordId !== recordsToMove[0],
        )
      : otherRecordIdsInDestinationColumn;

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

  recordsToMove.forEach((recordId: string, index: number) => {
    if (recordsToMove.length > 1) {
      const maxIncrement = recordAfter?.position
        ? (recordAfter.position - basePosition) / (recordsToMove.length + 1)
        : 0.0001;

      const safeIncrement = Math.min(maxIncrement, 0.0001);
      positions[recordId] = basePosition + index * safeIncrement;
    } else {
      positions[recordId] = basePosition;
    }
  });

  return positions;
};
