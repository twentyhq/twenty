import { isDefined } from 'twenty-shared/utils';

import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTableRowIndex } from '@/object-record/record-table/record-table-row/hooks/useRecordTableRowIndex';
import { getRecordTableRowFocusId } from '@/object-record/record-table/record-table-row/utils/getRecordTableRowFocusId';

export const useRecordTableRowFocusId = () => {
  const rowIndex = useRecordTableRowIndex();

  const { recordTableId } = useRecordTableContextOrThrow();

  return isDefined(rowIndex)
    ? getRecordTableRowFocusId({ recordTableId, rowIndex })
    : null;
};
