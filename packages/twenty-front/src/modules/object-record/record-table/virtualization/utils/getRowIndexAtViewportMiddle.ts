import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';

export const getRowIndexAtViewportMiddle = ({
  scrollTop,
  viewportHeight,
}: {
  scrollTop: number;
  viewportHeight: number;
}): number => {
  const rowHeight = RECORD_TABLE_ROW_HEIGHT + 1;

  return (
    Math.floor(scrollTop / rowHeight) +
    Math.floor(viewportHeight / rowHeight / 2)
  );
};
