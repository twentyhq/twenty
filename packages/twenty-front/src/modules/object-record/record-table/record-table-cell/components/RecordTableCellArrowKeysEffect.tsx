import { useRecordTableCellFocusHotkeys } from '@/object-record/record-table/record-table-cell/hooks/useRecordTableCellFocusHotkeys';

export const RecordTableCellArrowKeysEffect = ({
  cellFocusId,
}: {
  cellFocusId: string;
}) => {
  useRecordTableCellFocusHotkeys({
    focusId: cellFocusId,
  });

  return null;
};
