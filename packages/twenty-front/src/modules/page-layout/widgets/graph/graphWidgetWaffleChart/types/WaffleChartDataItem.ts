import { type GraphColor } from '@/page-layout/widgets/graph/types/GraphColor';

export type WaffleChartDataItem = {
  id: string;
  value: number;
  label: string;
  color?: GraphColor;
};
