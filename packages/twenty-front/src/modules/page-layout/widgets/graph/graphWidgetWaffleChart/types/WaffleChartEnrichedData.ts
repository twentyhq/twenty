import { type WaffleChartDataItem } from '@/page-layout/widgets/graph/graphWidgetWaffleChart/types/WaffleChartDataItem';
import { type GraphColorScheme } from '@/page-layout/widgets/graph/types/GraphColorScheme';

export type WaffleChartEnrichedData = WaffleChartDataItem & {
  colorScheme: GraphColorScheme;
  percentage: number;
};
