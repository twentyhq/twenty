import { type GraphColor } from '@/page-layout/widgets/graph/types/GraphColor';

export type PieChartDataItem = {
  id: string;
  value: number;
  color?: GraphColor;
};
