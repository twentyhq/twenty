import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTableHotkeys } from '@/object-record/record-table/hooks/useRecordTableHotkeys';

export const RecordTableFocusModeHotkeysSetterEffect = () => {
  const { recordTableId } = useRecordTableContextOrThrow();

  useRecordTableHotkeys(recordTableId);

  return <></>;
};
