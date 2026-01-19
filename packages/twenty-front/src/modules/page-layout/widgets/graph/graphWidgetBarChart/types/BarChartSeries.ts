import { type GraphColor } from '@/page-layout/widgets/graph/types/GraphColor';
import { type BarChartSeries } from '~/generated/graphql';

export type BarChartSeriesWithColor = BarChartSeries & {
  color?: GraphColor;
};
