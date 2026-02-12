import { type BarPosition } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarPosition';

export type BarChartSlice = {
  indexValue: string;
  bars: BarPosition[];
  sliceLeft: number;
  sliceRight: number;
  sliceCenter: number;
};
