import { type BarChartSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSlice';

export const findSliceAtPosition = (
  slices: BarChartSlice[],
  position: number,
): BarChartSlice | null => {
  for (const slice of slices) {
    if (position >= slice.sliceLeft && position <= slice.sliceRight) {
      return slice;
    }
  }
  return null;
};
