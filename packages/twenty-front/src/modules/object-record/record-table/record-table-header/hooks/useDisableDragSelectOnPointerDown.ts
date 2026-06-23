import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useCallback } from 'react';

// Prevents the record table cell drag-select from starting when interacting with a column header.
// Pointer capture is intentionally avoided: capturing on pointerdown retargets the pointerup/click
// to the cell and stops the column header dropdown from opening. dnd-kit handles drag pointer tracking.
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
