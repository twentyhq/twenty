import { type GraphColorScheme } from '@/page-layout/widgets/graph/types/GraphColorScheme';

export type BarChartConfig = {
  key: string;
  indexValue: string | number;
  gradientId: string;
  colorScheme: GraphColorScheme;
};
