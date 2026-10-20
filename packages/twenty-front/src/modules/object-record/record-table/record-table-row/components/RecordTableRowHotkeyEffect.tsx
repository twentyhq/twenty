import { useRecordTableRowHotkeys } from '@/object-record/record-table/record-table-row/hooks/useRecordTableRowHotkeys';

type RecordTableRowHotkeyEffectProps = {
  focusId: string;
};

export const RecordTableRowHotkeyEffect = ({
  focusId,
}: RecordTableRowHotkeyEffectProps) => {
  useRecordTableRowHotkeys(focusId);

  return null;
};
