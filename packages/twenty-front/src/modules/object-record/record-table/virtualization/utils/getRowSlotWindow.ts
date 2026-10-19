import { getRowIndexAtViewportMiddle } from '@/object-record/record-table/virtualization/utils/getRowIndexAtViewportMiddle';
import { ROW_SLOT_COUNT } from '@/object-record/record-table/virtualization/constants/RowSlotCount';

export const getRowSlotWindow = ({
  scrollTop,
  viewportHeight,
  totalNumberOfRows,
}: {
  scrollTop: number;
  viewportHeight: number;
  totalNumberOfRows: number;
}): { firstRowIndex: number; lastRowIndex: number } => {
  const middleRowIndex = getRowIndexAtViewportMiddle({
    scrollTop,
    viewportHeight,
  });

  const lastRowIndex = Math.min(
    totalNumberOfRows - 1,
    Math.max(0, middleRowIndex - ROW_SLOT_COUNT / 2) + ROW_SLOT_COUNT - 1,
  );

  return {
    firstRowIndex: Math.max(0, lastRowIndex - ROW_SLOT_COUNT + 1),
    lastRowIndex,
  };
};
