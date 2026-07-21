import { useDragSelect } from './useDragSelect';

export const useDisableDragSelectOnPointerDown = () => {
  const { setDragSelectionStartEnabled } = useDragSelect();

  const handlePointerDown = () => setDragSelectionStartEnabled(false);
  const handlePointerEnd = () => setDragSelectionStartEnabled(true);

  return {
    onPointerDown: handlePointerDown,
    onPointerUp: handlePointerEnd,
    onPointerCancel: handlePointerEnd,
  };
};
