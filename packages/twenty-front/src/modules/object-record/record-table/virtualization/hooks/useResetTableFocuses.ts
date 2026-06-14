import { useCallback } from 'react';

import { useFocusedRecordTableRow } from '@/object-record/record-table/hooks/useFocusedRecordTableRow';
import { useUnfocusRecordTableCell } from '@/object-record/record-table/record-table-cell/hooks/useUnfocusRecordTableCell';

export const useResetTableFocuses = (recordTableId: string) => {
  const { unfocusRecordTableCell } = useUnfocusRecordTableCell(recordTableId);
  const { unfocusRecordTableRow } = useFocusedRecordTableRow(recordTableId);

  const resetTableFocuses = useCallback(() => {
    unfocusRecordTableCell();
    unfocusRecordTableRow();
  }, [unfocusRecordTableCell, unfocusRecordTableRow]);

  return {
    resetTableFocuses,
  };
};
