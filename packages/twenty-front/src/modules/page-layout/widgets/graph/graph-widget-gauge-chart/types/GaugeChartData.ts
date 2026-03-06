import { type GraphColor } from '@/page-layout/widgets/graph/types/GraphColor';

export type GaugeChartData = {
  value: number;
  min: number;
  max: number;
  color?: GraphColor;
  label?: string;
};
