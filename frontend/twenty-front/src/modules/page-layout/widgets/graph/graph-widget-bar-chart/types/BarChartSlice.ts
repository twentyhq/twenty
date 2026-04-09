import { type BarPosition } from '@/page-layout/widgets/graph/graph-widget-bar-chart/types/BarPosition';

export type BarChartSlice = {
  indexValue: string;
  bars: BarPosition[];
  sliceLeft: number;
  sliceRight: number;
  sliceCenter: number;
};
