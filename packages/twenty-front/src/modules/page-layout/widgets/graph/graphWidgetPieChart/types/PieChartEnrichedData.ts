import { type PieChartDataItemWithColor } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
import { type GraphColorScheme } from '@/page-layout/widgets/graph/types/GraphColorScheme';

export type PieChartEnrichedData = PieChartDataItemWithColor & {
  colorScheme: GraphColorScheme;
  percentage: number;
};
