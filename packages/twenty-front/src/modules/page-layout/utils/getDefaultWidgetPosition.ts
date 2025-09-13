import { type GridBounds } from './calculateGridBoundsFromSelectedCells';

export const getDefaultWidgetPosition = (
  draggedArea: GridBounds | null,
  defaultSize: { w: number; h: number },
): GridBounds => {
  if (draggedArea !== null) {
    return draggedArea;
  }

  return {
    x: 0,
    y: 0,
    w: defaultSize.w,
    h: defaultSize.h,
  };
};
