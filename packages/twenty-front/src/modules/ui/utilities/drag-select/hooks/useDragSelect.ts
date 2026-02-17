import { useCallback } from 'react';

import { isDragSelectionStartEnabledStateV2 } from '@/ui/utilities/drag-select/states/internal/isDragSelectionStartEnabledStateV2';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

export const useDragSelect = () => {
  const setIsDragSelectionStartEnabled = useSetRecoilStateV2(
    isDragSelectionStartEnabledStateV2,
  );

  const setDragSelectionStartEnabled = (isEnabled: boolean) => {
    setIsDragSelectionStartEnabled(isEnabled);
  };

  const isDragSelectionStartEnabled = useCallback(
    () => jotaiStore.get(isDragSelectionStartEnabledStateV2.atom),
    [],
  );

  return {
    isDragSelectionStartEnabled,
    setDragSelectionStartEnabled,
  };
};
