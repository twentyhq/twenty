import { SOFT_FOCUS_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-table/constants/SoftFocusClickOutsideListenerId';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';

import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useCloseCurrentTableCellInEditMode } from '@/object-record/record-table/hooks/internal/useCloseCurrentTableCellInEditMode';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';
import { useCallback } from 'react';

export const useCloseRecordTableCellNoGroup = () => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const setHotkeyScope = useSetHotkeyScope();

  const { setDragSelectionStartEnabled } = useDragSelect();

  const { toggleClickOutsideListener } = useClickOutsideListener(
    SOFT_FOCUS_CLICK_OUTSIDE_LISTENER_ID,
  );

  const closeCurrentTableCellInEditMode =
    useCloseCurrentTableCellInEditMode(recordTableId);

  const closeTableCellNoGroup = useCallback(() => {
    toggleClickOutsideListener(true);
    setDragSelectionStartEnabled(true);
    closeCurrentTableCellInEditMode();
    setHotkeyScope(TableHotkeyScope.TableSoftFocus);
  }, [
    closeCurrentTableCellInEditMode,
    setDragSelectionStartEnabled,
    setHotkeyScope,
    toggleClickOutsideListener,
  ]);

  return {
    closeTableCellNoGroup,
  };
};
