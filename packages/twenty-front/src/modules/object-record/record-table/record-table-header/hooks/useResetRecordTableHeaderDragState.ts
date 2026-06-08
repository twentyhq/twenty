import { isRecordTableHeaderDropProcessingComponentState } from '@/object-record/record-table/record-table-header/states/isRecordTableHeaderDropProcessingComponentState';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useCallback } from 'react';
import { useStore } from 'jotai';

export const useResetRecordTableHeaderDragStates = () => {
  const store = useStore();

  const isRecordTableHeaderDropProcessingCallbackState =
    useAtomComponentStateCallbackState(
      isRecordTableHeaderDropProcessingComponentState,
    );

  const { setDragSelectionStartEnabled } = useDragSelect();

  const resetRecordTableHeaderDragStates = useCallback(() => {
    store.set(isRecordTableHeaderDropProcessingCallbackState, false);
    setDragSelectionStartEnabled(true);
  }, [
    store,
    isRecordTableHeaderDropProcessingCallbackState,
    setDragSelectionStartEnabled,
  ]);

  return {
    resetRecordTableHeaderDragStates,
  };
};
