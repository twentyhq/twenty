import { type LineChartDataPoint } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartDataPoint';
import { type GraphColor } from '@/page-layout/widgets/graph/types/GraphColor';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';

export type LineChartSeries = {
  id: string;
  label?: string;
  color?: GraphColor;
  data: LineChartDataPoint[];
  enableArea?: boolean;
  rawValue?: RawDimensionValue;
};
