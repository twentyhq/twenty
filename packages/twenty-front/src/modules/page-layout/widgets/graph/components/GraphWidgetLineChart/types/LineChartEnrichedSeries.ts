import { type GraphColorScheme } from '../../../types/GraphColorScheme';
import { type LineChartSeries } from './LineChartSeries';

export type LineChartEnrichedSeries = LineChartSeries & {
  colorScheme: GraphColorScheme;
  gradientId: string;
  shouldEnableArea: boolean;
  label: string;
};
