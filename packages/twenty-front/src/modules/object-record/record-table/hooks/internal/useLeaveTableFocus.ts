import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { useSetIsFocusActive } from '@/object-record/record-table/record-table-cell/hooks/useSetIsFocusActive';
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

  const { setIsFocusActiveForCurrentPosition } = useSetIsFocusActive(
    recordTableIdFromContext,
  );

  return () => {
    resetTableRowSelection();

    setIsFocusActiveForCurrentPosition(false);
  };
};
