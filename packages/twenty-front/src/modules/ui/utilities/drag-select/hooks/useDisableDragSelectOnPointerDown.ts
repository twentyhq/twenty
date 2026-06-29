import { useCallback } from 'react';

import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';

// Prevents drag-select from starting when interacting with header controls.
// Pointer capture is intentionally avoided because it retargets pointerup/click
// and breaks dropdown interactions. dnd-kit handles drag pointer tracking.
export const useDisableDragSelectOnPointerDown = () => {
  const { setDragSelectionStartEnabled } = useDragSelect();

  const handlePointerDown = useCallback(() => {
    setDragSelectionStartEnabled(false);
  }, [setDragSelectionStartEnabled]);

  const handlePointerEnd = useCallback(() => {
    setDragSelectionStartEnabled(true);
  }, [setDragSelectionStartEnabled]);

  return {
    onPointerDown: handlePointerDown,
    onPointerUp: handlePointerEnd,
    onPointerCancel: handlePointerEnd,
  };
};
