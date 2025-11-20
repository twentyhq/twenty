import { type GraphColor } from '@/page-layout/widgets/graph/types/GraphColor';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';

export type BarChartSeries = {
  key: string;
  label?: string;
  color?: GraphColor;
  rawValue?: RawDimensionValue;
};
