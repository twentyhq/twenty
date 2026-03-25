import { type LineChartSeriesWithColor } from '@/page-layout/widgets/graph/graph-widget-line-chart/types/LineChartSeriesWithColor';
import { type GraphColorScheme } from '@/page-layout/widgets/graph/types/GraphColorScheme';

export type LineChartEnrichedSeries = LineChartSeriesWithColor & {
  colorScheme: GraphColorScheme;
  areaFillId: string;
  label: string;
};
