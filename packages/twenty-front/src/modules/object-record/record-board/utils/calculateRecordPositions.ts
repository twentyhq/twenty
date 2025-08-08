import { calculateDragPositions } from '@/object-record/record-drag/shared/utils/calculateDragPositions';

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

/**
 * @deprecated Use calculateDragPositions from '@/object-record/record-drag/shared/utils/calculateDragPositions' instead
 * This wrapper is maintained for backward compatibility
 */
export const calculateRecordPositions = ({
  destinationRecordIds,
  recordsToMove,
  destinationIndex,
  recordPositionData,
}: PositionCalculationContext): Record<string, number> => {
  return calculateDragPositions({
    recordIds: destinationRecordIds,
    recordsToMove,
    destinationIndex,
    recordPositionData,
  });
};
