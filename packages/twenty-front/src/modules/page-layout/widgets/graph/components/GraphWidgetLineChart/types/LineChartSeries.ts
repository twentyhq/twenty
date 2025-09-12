import { type GraphColor } from '../../../types/GraphColor';
import { type LineChartDataPoint } from './LineChartDataPoint';

export type LineChartSeries = {
  id: string;
  label?: string;
  color?: GraphColor;
  data: LineChartDataPoint[];
  enableArea?: boolean;
};
