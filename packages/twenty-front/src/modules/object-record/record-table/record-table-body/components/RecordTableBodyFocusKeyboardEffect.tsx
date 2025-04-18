import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';

export const RecordTableBodyFocusKeyboardEffect = () => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const { useMapKeyboardToFocus } = useRecordTable({
    recordTableId,
  });

  useMapKeyboardToFocus();

  return <></>;
};
