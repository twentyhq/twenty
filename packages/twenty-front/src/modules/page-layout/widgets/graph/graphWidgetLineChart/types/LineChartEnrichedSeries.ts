import { type LineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeries';
import { type GraphColorScheme } from '@/page-layout/widgets/graph/types/GraphColorScheme';

export type LineChartEnrichedSeries = LineChartSeries & {
  colorScheme: GraphColorScheme;
  gradientId: string;
  shouldEnableArea: boolean;
  label: string;
};
