import { useCallback } from 'react';

import { useFocusedRecordTableRow } from '@/object-record/record-table/hooks/useFocusedRecordTableRow';
import { useUnfocusRecordTableCell } from '@/object-record/record-table/record-table-cell/hooks/useUnfocusRecordTableCell';
import { recordTableHoverPositionComponentState } from '@/object-record/record-table/states/recordTableHoverPositionComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';

export const useResetTableFocuses = (recordTableId: string) => {
  const { unfocusRecordTableCell } = useUnfocusRecordTableCell(recordTableId);
  const { unfocusRecordTableRow } = useFocusedRecordTableRow(recordTableId);

  const setRecordTableHoverPosition = useSetAtomComponentState(
    recordTableHoverPositionComponentState,
    recordTableId,
  );

  const resetTableFocuses = useCallback(() => {
    unfocusRecordTableCell();
    unfocusRecordTableRow();
    setRecordTableHoverPosition(null);
  }, [
    unfocusRecordTableCell,
    unfocusRecordTableRow,
    setRecordTableHoverPosition,
  ]);

  return {
    resetTableFocuses,
  };
};
