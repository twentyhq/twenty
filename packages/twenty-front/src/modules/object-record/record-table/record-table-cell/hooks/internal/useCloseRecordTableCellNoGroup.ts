import { FOCUS_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-table/constants/FocusClickOutsideListenerId';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';

import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useCloseCurrentTableCellInEditMode } from '@/object-record/record-table/hooks/internal/useCloseCurrentTableCellInEditMode';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';
import { useResetFocusStackToFocusItem } from '@/ui/utilities/focus/hooks/useResetFocusStackToFocusItem';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useCallback } from 'react';

export const useCloseRecordTableCellNoGroup = () => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const { setDragSelectionStartEnabled } = useDragSelect();

  const { toggleClickOutside } = useClickOutsideListener(
    FOCUS_CLICK_OUTSIDE_LISTENER_ID,
  );

  const closeCurrentTableCellInEditMode =
    useCloseCurrentTableCellInEditMode(recordTableId);

  const { resetFocusStackToFocusItem } = useResetFocusStackToFocusItem();

  const closeTableCellNoGroup = useCallback(() => {
    toggleClickOutside(true);
    setDragSelectionStartEnabled(true);
    closeCurrentTableCellInEditMode();

    resetFocusStackToFocusItem({
      focusStackItem: {
        focusId: recordTableId,
        componentInstance: {
          componentType: FocusComponentType.RECORD_TABLE,
          componentInstanceId: recordTableId,
        },
        globalHotkeysConfig: {
          enableGlobalHotkeysConflictingWithKeyboard: false,
          enableGlobalHotkeysWithModifiers: true,
        },
      },
      hotkeyScope: {
        scope: TableHotkeyScope.TableFocus,
        customScopes: {
          goto: true,
          keyboardShortcutMenu: true,
          searchRecords: true,
        },
      },
    });
  }, [
    closeCurrentTableCellInEditMode,
    recordTableId,
    resetFocusStackToFocusItem,
    setDragSelectionStartEnabled,
    toggleClickOutside,
  ]);

  return {
    closeTableCellNoGroup,
  };
};
