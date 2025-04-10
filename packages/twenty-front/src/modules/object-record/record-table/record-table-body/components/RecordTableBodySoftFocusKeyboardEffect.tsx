import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';

export const RecordTableBodySoftFocusKeyboardEffect = () => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const { useMapKeyboardToSoftFocus } = useRecordTable({
    recordTableId,
  });

  useMapKeyboardToSoftFocus();

  return <></>;
};
