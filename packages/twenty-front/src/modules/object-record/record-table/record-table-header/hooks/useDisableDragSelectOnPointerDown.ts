import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { type PointerEvent, useCallback } from 'react';

export const useDisableDragSelectOnPointerDown = () => {
  const { setDragSelectionStartEnabled } = useDragSelect();

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragSelectionStartEnabled(false);
    },
    [setDragSelectionStartEnabled],
  );

  const handlePointerEnd = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      setDragSelectionStartEnabled(true);
    },
    [setDragSelectionStartEnabled],
  );

  return {
    onPointerDown: handlePointerDown,
    onPointerUp: handlePointerEnd,
    onPointerCancel: handlePointerEnd,
  };
};
