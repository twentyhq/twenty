import { type LineChartDataPoint } from '@/page-layout/widgets/graph/components/graphWidgetLineChart/types/LineChartDataPoint';
import { type GraphColor } from '@/page-layout/widgets/graph/types/GraphColor';

export type LineChartSeries = {
  id: string;
  label?: string;
  color?: GraphColor;
  data: LineChartDataPoint[];
  enableArea?: boolean;
};
