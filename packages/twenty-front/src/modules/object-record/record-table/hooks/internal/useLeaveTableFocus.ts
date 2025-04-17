import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { useSetIsRecordTableFocusActive } from '@/object-record/record-table/record-table-cell/hooks/useSetIsRecordTableFocusActive';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';

export const useLeaveTableFocus = (recordTableId?: string) => {
  const recordTableIdFromContext = useAvailableComponentInstanceIdOrThrow(
    RecordTableComponentInstanceContext,
    recordTableId,
  );

  const resetTableRowSelection = useResetTableRowSelection(
    recordTableIdFromContext,
  );

  const { setIsFocusActiveForCurrentPosition } = useSetIsRecordTableFocusActive(
    recordTableIdFromContext,
  );

  return () => {
    resetTableRowSelection();

    setIsFocusActiveForCurrentPosition(false);
  };
};
