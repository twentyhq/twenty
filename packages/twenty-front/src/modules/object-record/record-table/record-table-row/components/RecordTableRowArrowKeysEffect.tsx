import { useRecordTableRowArrowKeys } from '@/object-record/record-table/record-table-row/hooks/useRecordTableRowArrowKeys';
import { useRecordTableRowFocusId } from '@/object-record/record-table/record-table-row/hooks/useRecordTableRowFocusId';

export const RecordTableRowArrowKeysEffect = () => {
  const recordTableRowFocusId = useRecordTableRowFocusId();

  useRecordTableRowArrowKeys(recordTableRowFocusId);

  return null;
};
