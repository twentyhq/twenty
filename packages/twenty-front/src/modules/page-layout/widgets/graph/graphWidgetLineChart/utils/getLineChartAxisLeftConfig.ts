import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '@/page-layout/widgets/graph/utils/graphFormatters';
import { NO_ROTATION_ANGLE } from '@/page-layout/widgets/graph/utils/noRotationAngle';

export const getLineChartAxisLeftConfig = (
  yAxisLabel?: string,
  formatOptions?: GraphValueFormatOptions,
) => ({
  tickSize: 0,
  tickPadding: 5,
  tickRotation: NO_ROTATION_ANGLE,
  legend: yAxisLabel,
  legendPosition: 'middle' as const,
  legendOffset: -50,
  format: (value: number) => formatGraphValue(value, formatOptions || {}),
});
