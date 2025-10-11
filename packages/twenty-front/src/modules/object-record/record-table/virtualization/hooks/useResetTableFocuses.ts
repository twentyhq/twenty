import { useFocusedRecordTableRow } from '@/object-record/record-table/hooks/useFocusedRecordTableRow';
import { useUnfocusRecordTableCell } from '@/object-record/record-table/record-table-cell/hooks/useUnfocusRecordTableCell';
import { recordTableHoverPositionComponentState } from '@/object-record/record-table/states/recordTableHoverPositionComponentState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';

export const useResetTableFocuses = (recordTableId: string) => {
  const { unfocusRecordTableCell } = useUnfocusRecordTableCell(recordTableId);
  const { unfocusRecordTableRow } = useFocusedRecordTableRow(recordTableId);

  const setRecordTableHoverPosition = useSetRecoilComponentState(
    recordTableHoverPositionComponentState,
    recordTableId,
  );

  const resetTableFocuses = () => {
    unfocusRecordTableCell();
    unfocusRecordTableRow();
    setRecordTableHoverPosition(null);
  };

  return {
    resetTableFocuses,
  };
};
