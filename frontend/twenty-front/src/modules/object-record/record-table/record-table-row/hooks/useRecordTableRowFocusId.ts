import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { getRecordTableRowFocusId } from '@/object-record/record-table/record-table-row/utils/getRecordTableRowFocusId';

export const useRecordTableRowFocusId = () => {
  const { rowIndex } = useRecordTableRowContextOrThrow();

  const { recordTableId } = useRecordTableContextOrThrow();

  return getRecordTableRowFocusId({
    recordTableId,
    rowIndex,
  });
};
