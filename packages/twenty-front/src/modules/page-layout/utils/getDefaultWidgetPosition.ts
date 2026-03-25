import { type GridBounds } from './calculateGridBoundsFromSelectedCells';

export const getDefaultWidgetPosition = (
  draggedArea: GridBounds | null,
  defaultSize: { w: number; h: number },
  minimumSize: { w: number; h: number },
): GridBounds => {
  if (draggedArea !== null) {
    return {
      x: draggedArea.x,
      y: draggedArea.y,
      w: Math.max(draggedArea.w, minimumSize.w),
      h: Math.max(draggedArea.h, minimumSize.h),
    };
  }

  return {
    x: 0,
    y: 0,
    w: defaultSize.w,
    h: defaultSize.h,
  };
};
