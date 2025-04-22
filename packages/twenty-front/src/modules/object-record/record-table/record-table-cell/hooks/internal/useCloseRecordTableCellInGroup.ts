import { useRecoilCallback } from 'recoil';

import { FOCUS_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-table/constants/FocusClickOutsideListenerId';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';

import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useCloseCurrentTableCellInEditMode } from '@/object-record/record-table/hooks/internal/useCloseCurrentTableCellInEditMode';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';

export const useCloseRecordTableCellInGroup = () => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const setHotkeyScope = useSetHotkeyScope();
  const { setDragSelectionStartEnabled } = useDragSelect();

  const { toggleClickOutside } = useClickOutsideListener(
    FOCUS_CLICK_OUTSIDE_LISTENER_ID,
  );

  const closeCurrentTableCellInEditMode =
    useCloseCurrentTableCellInEditMode(recordTableId);

  const closeTableCellInGroup = useRecoilCallback(
    () => () => {
      toggleClickOutside(true);
      setDragSelectionStartEnabled(true);
      closeCurrentTableCellInEditMode();
      setHotkeyScope(TableHotkeyScope.TableFocus);
    },
    [
      closeCurrentTableCellInEditMode,
      setDragSelectionStartEnabled,
      setHotkeyScope,
      toggleClickOutside,
    ],
  );

  return {
    closeTableCellInGroup,
  };
};
