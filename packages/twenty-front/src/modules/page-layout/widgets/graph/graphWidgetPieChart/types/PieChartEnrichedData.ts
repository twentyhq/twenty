import { type PieChartDataItem } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
import { type GraphColorScheme } from '@/page-layout/widgets/graph/types/GraphColorScheme';

export type PieChartEnrichedData = PieChartDataItem & {
  colorScheme: GraphColorScheme;
  percentage: number;
};
