import { LINE_CHART_MARGIN_LEFT } from '@/page-layout/widgets/graph/graphWidgetLineChart/constants/LineChartMarginLeft';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '@/page-layout/widgets/graph/utils/graphFormatters';

const LEFT_AXIS_LEGEND_OFFSET_PADDING = 5;
const TICK_PADDING = 5;

export const getLineChartAxisLeftConfig = (
  yAxisLabel?: string,
  formatOptions?: GraphValueFormatOptions,
  tickValues?: number[],
  marginLeft: number = LINE_CHART_MARGIN_LEFT,
) => ({
  tickSize: 0,
  tickPadding: TICK_PADDING,
  tickRotation: 0,
  tickValues,
  legend: yAxisLabel,
  legendPosition: 'middle' as const,
  legendOffset: -marginLeft + LEFT_AXIS_LEGEND_OFFSET_PADDING,
  format: (value: number) => formatGraphValue(value, formatOptions || {}),
});
