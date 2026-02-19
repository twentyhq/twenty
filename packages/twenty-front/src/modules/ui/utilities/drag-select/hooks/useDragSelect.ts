import { useCallback } from 'react';

import { isDragSelectionStartEnabledStateV2 } from '@/ui/utilities/drag-select/states/internal/isDragSelectionStartEnabledStateV2';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import { useStore } from 'jotai';

export const useDragSelect = () => {
  const store = useStore();

  const setIsDragSelectionStartEnabled = useSetRecoilStateV2(
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
