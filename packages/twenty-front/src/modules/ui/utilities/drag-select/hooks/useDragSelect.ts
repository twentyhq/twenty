import { useCallback } from 'react';

import { isDragSelectionStartEnabledStateV2 } from '@/ui/utilities/drag-select/states/internal/isDragSelectionStartEnabledStateV2';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useStore } from 'jotai';

export const useDragSelect = () => {
  const store = useStore();

  const setIsDragSelectionStartEnabled = useSetAtomState(
    isDragSelectionStartEnabledStateV2,
  );

  const setDragSelectionStartEnabled = (isEnabled: boolean) => {
    setIsDragSelectionStartEnabled(isEnabled);
  };

  const isDragSelectionStartEnabled = useCallback(
    () => store.get(isDragSelectionStartEnabledStateV2.atom),
    [store],
  );

  return {
    isDragSelectionStartEnabled,
    setDragSelectionStartEnabled,
  };
};
