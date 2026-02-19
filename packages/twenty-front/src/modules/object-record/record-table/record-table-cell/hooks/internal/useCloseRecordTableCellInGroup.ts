import { FOCUS_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-table/constants/FocusClickOutsideListenerId';
import { RECORD_TABLE_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-table/constants/RecordTableClickOutsideListenerId';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';

import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useCloseCurrentTableCellInEditMode } from '@/object-record/record-table/hooks/internal/useCloseCurrentTableCellInEditMode';
import { clickOutsideListenerIsActivatedComponentState } from '@/ui/utilities/pointer-event/states/clickOutsideListenerIsActivatedComponentState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useCallback } from 'react';

export const useCloseRecordTableCellInGroup = () => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const { setDragSelectionStartEnabled } = useDragSelect();

  const { toggleClickOutside } = useClickOutsideListener(
    FOCUS_CLICK_OUTSIDE_LISTENER_ID,
  );

  const closeCurrentTableCellInEditMode =
    useCloseCurrentTableCellInEditMode(recordTableId);

  const closeTableCellInGroup = useCallback(
    () => {
      toggleClickOutside(true);
      setDragSelectionStartEnabled(true);
      closeCurrentTableCellInEditMode();
      jotaiStore.set(
        clickOutsideListenerIsActivatedComponentState.atomFamily({
          instanceId: RECORD_TABLE_CLICK_OUTSIDE_LISTENER_ID,
        }),
        true,
      );
    },
    [
      closeCurrentTableCellInEditMode,
      setDragSelectionStartEnabled,
      toggleClickOutside,
    ],
  );

  return {
    closeTableCellInGroup,
  };
};
