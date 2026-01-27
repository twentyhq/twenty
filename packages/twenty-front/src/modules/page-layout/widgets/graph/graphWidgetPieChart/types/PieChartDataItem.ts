import { type GraphColor } from '@/page-layout/widgets/graph/types/GraphColor';
import { type PieChartDataItem } from '~/generated/graphql';

export type PieChartDataItemWithColor = PieChartDataItem & {
  color?: GraphColor;
};
