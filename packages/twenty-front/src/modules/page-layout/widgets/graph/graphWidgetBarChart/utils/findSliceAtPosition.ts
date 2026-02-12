import { type BarChartSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSlice';

export const findSliceAtPosition = ({
  mouseX,
  mouseY,
  slices,
  isVerticalLayout,
}: {
  mouseX: number;
  mouseY: number;
  slices: BarChartSlice[];
  isVerticalLayout: boolean;
}): BarChartSlice | null => {
  if (slices.length === 0) {
    return null;
  }

  const positionAlongAxis = isVerticalLayout ? mouseX : mouseY;

  const nearestSlice = slices.reduce((nearest, slice) => {
    const currentDistance = Math.abs(slice.sliceCenter - positionAlongAxis);
    const nearestDistance = Math.abs(nearest.sliceCenter - positionAlongAxis);
    return currentDistance < nearestDistance ? slice : nearest;
  });

  return nearestSlice;
};
