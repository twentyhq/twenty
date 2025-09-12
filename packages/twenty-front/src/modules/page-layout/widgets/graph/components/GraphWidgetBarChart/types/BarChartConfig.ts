import { type GraphColorScheme } from '../../../types/GraphColorScheme';

export type BarChartConfig = {
  key: string;
  indexValue: string | number;
  gradientId: string;
  colorScheme: GraphColorScheme;
};
