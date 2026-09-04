import { FOCUS_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-table/constants/FocusClickOutsideListenerId';
import { RECORD_TABLE_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-table/constants/RecordTableClickOutsideListenerId';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';

import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useCloseCurrentTableCellInEditMode } from '@/object-record/record-table/hooks/internal/useCloseCurrentTableCellInEditMode';
import { clickOutsideListenerIsActivatedComponentState } from '@/ui/utilities/pointer-event/states/clickOutsideListenerIsActivatedComponentState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { useComponentStateSurfaceId } from '@/ui/utilities/state/component-state/hooks/useComponentStateSurfaceId';

export const useCloseRecordTableCellInGroup = () => {
  const surfaceId = useComponentStateSurfaceId();
  const { recordTableId } = useRecordTableContextOrThrow();
  const store = useStore();

  const { setDragSelectionStartEnabled } = useDragSelect();

  const { toggleClickOutside } = useClickOutsideListener(
    FOCUS_CLICK_OUTSIDE_LISTENER_ID,
  );

  const closeCurrentTableCellInEditMode =
    useCloseCurrentTableCellInEditMode(recordTableId);

  const closeTableCellInGroup = useCallback(() => {
    toggleClickOutside(true);
    setDragSelectionStartEnabled(true);
    closeCurrentTableCellInEditMode();
    store.set(
      clickOutsideListenerIsActivatedComponentState.atomFamily({
        instanceId: RECORD_TABLE_CLICK_OUTSIDE_LISTENER_ID,
        surfaceId,
      }),
      true,
    );
  }, [
    closeCurrentTableCellInEditMode,
    setDragSelectionStartEnabled,
    toggleClickOutside,
    store,
    surfaceId,
  ]);

  return {
    closeTableCellInGroup,
  };
};
