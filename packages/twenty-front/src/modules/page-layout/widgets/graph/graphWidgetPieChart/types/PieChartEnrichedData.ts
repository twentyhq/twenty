import { type PieChartDataItem } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
import { type GraphColorScheme } from '@/page-layout/widgets/graph/types/GraphColorScheme';

export type PieChartEnrichedData = PieChartDataItem & {
  gradientId: string;
  colorScheme: GraphColorScheme;
  isHovered: boolean;
  percentage: number;
  middleAngle: number;
};
