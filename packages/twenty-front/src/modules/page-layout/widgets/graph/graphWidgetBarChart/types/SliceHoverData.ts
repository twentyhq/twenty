import { type BarChartSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSlice';
import { type VirtualElement } from '@floating-ui/react';

export type SliceHoverData = {
  slice: BarChartSlice;
  virtualElement: VirtualElement;
};
