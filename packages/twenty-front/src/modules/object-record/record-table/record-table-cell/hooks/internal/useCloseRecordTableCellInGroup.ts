import { useRecoilCallback } from 'recoil';

import { FOCUS_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-table/constants/FocusClickOutsideListenerId';
import { RECORD_TABLE_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-table/constants/RecordTableClickOutsideListenerId';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';

import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useCloseCurrentTableCellInEditMode } from '@/object-record/record-table/hooks/internal/useCloseCurrentTableCellInEditMode';
import { clickOutsideListenerIsActivatedComponentState } from '@/ui/utilities/pointer-event/states/clickOutsideListenerIsActivatedComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';

export const useCloseRecordTableCellInGroup = () => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const { setDragSelectionStartEnabled } = useDragSelect();

  const { toggleClickOutside } = useClickOutsideListener(
    FOCUS_CLICK_OUTSIDE_LISTENER_ID,
  );

  const closeCurrentTableCellInEditMode =
    useCloseCurrentTableCellInEditMode(recordTableId);

  const clickOutsideListenerIsActivatedState = useRecoilComponentCallbackState(
    clickOutsideListenerIsActivatedComponentState,
    RECORD_TABLE_CLICK_OUTSIDE_LISTENER_ID,
  );

  const closeTableCellInGroup = useRecoilCallback(
    ({ set }) =>
      () => {
        toggleClickOutside(true);
        setDragSelectionStartEnabled(true);
        closeCurrentTableCellInEditMode();
        set(clickOutsideListenerIsActivatedState, true);
      },
    [
      clickOutsideListenerIsActivatedState,
      closeCurrentTableCellInEditMode,
      setDragSelectionStartEnabled,
      toggleClickOutside,
    ],
  );

  return {
    closeTableCellInGroup,
  };
};
