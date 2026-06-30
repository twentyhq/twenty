import { type LineChartDataPoint } from '@/page-layout/widgets/graph/graph-widget-line-chart/types/LineChartDataPoint';
import { type GraphColor } from '@/page-layout/widgets/graph/types/GraphColor';
import { type LineChartSeries } from '~/generated-metadata/graphql';

export type LineChartSeriesWithColor = Omit<LineChartSeries, 'data'> & {
  color?: GraphColor;
  data: LineChartDataPoint[];
};
