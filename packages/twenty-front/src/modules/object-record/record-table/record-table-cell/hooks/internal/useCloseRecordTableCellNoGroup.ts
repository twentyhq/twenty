import { FOCUS_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-table/constants/FocusClickOutsideListenerId';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';

import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useCloseCurrentTableCellInEditMode } from '@/object-record/record-table/hooks/internal/useCloseCurrentTableCellInEditMode';
import { useCallback } from 'react';

export const useCloseRecordTableCellNoGroup = () => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const { setDragSelectionStartEnabled } = useDragSelect();

  const { toggleClickOutside } = useClickOutsideListener(
    FOCUS_CLICK_OUTSIDE_LISTENER_ID,
  );

  const closeCurrentTableCellInEditMode =
    useCloseCurrentTableCellInEditMode(recordTableId);

  const closeTableCellNoGroup = useCallback(() => {
    toggleClickOutside(true);
    setDragSelectionStartEnabled(true);
    closeCurrentTableCellInEditMode();
  }, [
    closeCurrentTableCellInEditMode,
    setDragSelectionStartEnabled,
    toggleClickOutside,
  ]);

  return {
    closeTableCellNoGroup,
  };
};
