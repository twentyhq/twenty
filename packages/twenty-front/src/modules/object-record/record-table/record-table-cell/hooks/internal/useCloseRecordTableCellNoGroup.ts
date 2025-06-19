import { FOCUS_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-table/constants/FocusClickOutsideListenerId';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';

import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useCloseCurrentTableCellInEditMode } from '@/object-record/record-table/hooks/internal/useCloseCurrentTableCellInEditMode';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';
import { useResetFocusStack } from '@/ui/utilities/focus/hooks/useResetFocusStack';
import { useCallback } from 'react';

export const useCloseRecordTableCellNoGroup = () => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const setHotkeyScope = useSetHotkeyScope();

  const { setDragSelectionStartEnabled } = useDragSelect();

  const { toggleClickOutside } = useClickOutsideListener(
    FOCUS_CLICK_OUTSIDE_LISTENER_ID,
  );

  const closeCurrentTableCellInEditMode =
    useCloseCurrentTableCellInEditMode(recordTableId);

  const { resetFocusStack } = useResetFocusStack();

  const closeTableCellNoGroup = useCallback(() => {
    toggleClickOutside(true);
    setDragSelectionStartEnabled(true);
    closeCurrentTableCellInEditMode();

    // TODO: Remove this once we've fully migrated away from hotkey scopes
    resetFocusStack();

    setHotkeyScope(TableHotkeyScope.TableFocus, {
      goto: true,
      keyboardShortcutMenu: true,
      searchRecords: true,
    });
  }, [
    closeCurrentTableCellInEditMode,
    resetFocusStack,
    setDragSelectionStartEnabled,
    setHotkeyScope,
    toggleClickOutside,
  ]);

  return {
    closeTableCellNoGroup,
  };
};
