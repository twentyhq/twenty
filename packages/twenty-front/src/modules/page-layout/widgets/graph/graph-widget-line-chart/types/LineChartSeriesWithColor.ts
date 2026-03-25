import { type LineChartDataPoint } from '@/page-layout/widgets/graph/graph-widget-line-chart/types/LineChartDataPoint';
import { type GraphColor } from '@/page-layout/widgets/graph/types/GraphColor';

export type LineChartSeriesWithColor = {
  id: string;
  label: string;
  color?: GraphColor;
  data: LineChartDataPoint[];
};
