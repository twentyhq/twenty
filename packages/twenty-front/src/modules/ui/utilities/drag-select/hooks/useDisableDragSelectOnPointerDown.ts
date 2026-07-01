import { useCallback, useEffect } from 'react';

import { useDragSelect } from './useDragSelect';

export const useDisableDragSelectOnPointerDown = () => {
  const { setDragSelectionStartEnabled } = useDragSelect();

  const handlePointerDown = useCallback(() => {
    setDragSelectionStartEnabled(false);
  }, [setDragSelectionStartEnabled]);

  const handlePointerEnd = useCallback(() => {
    setDragSelectionStartEnabled(true);
  }, [setDragSelectionStartEnabled]);

  useEffect(() => {
    document.addEventListener('pointerup', handlePointerEnd);
    document.addEventListener('pointercancel', handlePointerEnd);
    window.addEventListener('blur', handlePointerEnd);

    return () => {
      document.removeEventListener('pointerup', handlePointerEnd);
      document.removeEventListener('pointercancel', handlePointerEnd);
      window.removeEventListener('blur', handlePointerEnd);
      setDragSelectionStartEnabled(true);
    };
  }, [handlePointerEnd, setDragSelectionStartEnabled]);

  return {
    onPointerDown: handlePointerDown,
    onPointerUp: handlePointerEnd,
    onPointerCancel: handlePointerEnd,
  };
};
