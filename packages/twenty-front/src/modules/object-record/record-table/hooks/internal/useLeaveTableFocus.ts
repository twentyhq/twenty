import { useResetFocusStackToRecordIndex } from '@/object-record/record-index/hooks/useResetFocusStackToRecordIndex';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { useActiveRecordTableRow } from '@/object-record/record-table/hooks/useActiveRecordTableRow';
import { useFocusedRecordTableRow } from '@/object-record/record-table/hooks/useFocusedRecordTableRow';
import { useUnfocusRecordTableCell } from '@/object-record/record-table/record-table-cell/hooks/useUnfocusRecordTableCell';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { recordTableFocusPositionComponentState } from '@/object-record/record-table/states/recordTableFocusPositionComponentState';
import { recordTableHoverPositionComponentState } from '@/object-record/record-table/states/recordTableHoverPositionComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';

export const useLeaveTableFocus = (recordTableId?: string) => {
  const recordTableIdFromContext = useAvailableComponentInstanceIdOrThrow(
    RecordTableComponentInstanceContext,
    recordTableId,
  );

  const { resetTableRowSelection } = useResetTableRowSelection();

  const setRecordTableHoverPosition = useSetRecoilComponentState(
    recordTableHoverPositionComponentState,
    recordTableIdFromContext,
  );

  const setRecordTableFocusPosition = useSetRecoilComponentState(
    recordTableFocusPositionComponentState,
    recordTableIdFromContext,
  );

  const { unfocusRecordTableRow } = useFocusedRecordTableRow(
    recordTableIdFromContext,
  );

  const { deactivateRecordTableRow } = useActiveRecordTableRow(
    recordTableIdFromContext,
  );

  const { resetFocusStackToRecordIndex } = useResetFocusStackToRecordIndex();

  const { unfocusRecordTableCell } = useUnfocusRecordTableCell(
    recordTableIdFromContext,
  );

  return () => {
    unfocusRecordTableCell();

    resetTableRowSelection();

    unfocusRecordTableRow();

    deactivateRecordTableRow();

    setRecordTableHoverPosition(null);
    setRecordTableFocusPosition(null);

    resetFocusStackToRecordIndex();
  };
};
