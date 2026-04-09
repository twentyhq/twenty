import { useCallback } from 'react';

import { isDragSelectionStartEnabledState } from '@/ui/utilities/drag-select/states/internal/isDragSelectionStartEnabledState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useStore } from 'jotai';

export const useDragSelect = () => {
  const store = useStore();

  const setIsDragSelectionStartEnabled = useSetAtomState(
    isDragSelectionStartEnabledState,
  );

  const setDragSelectionStartEnabled = (isEnabled: boolean) => {
    setIsDragSelectionStartEnabled(isEnabled);
  };

  const isDragSelectionStartEnabled = useCallback(
    () => store.get(isDragSelectionStartEnabledState.atom),
    [store],
  );

  return {
    isDragSelectionStartEnabled,
    setDragSelectionStartEnabled,
  };
};
