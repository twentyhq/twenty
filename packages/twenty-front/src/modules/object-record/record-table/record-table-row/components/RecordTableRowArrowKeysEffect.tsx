import { useRecordTableRowFocusHotkeys } from '@/object-record/record-table/hooks/useRecordTableRowFocusHotkeys';

type RecordTableRowArrowKeysEffectProps = {
  focusId: string;
};

export const RecordTableRowArrowKeysEffect = ({
  focusId,
}: RecordTableRowArrowKeysEffectProps) => {
  useRecordTableRowFocusHotkeys({ focusId });

  return null;
};
