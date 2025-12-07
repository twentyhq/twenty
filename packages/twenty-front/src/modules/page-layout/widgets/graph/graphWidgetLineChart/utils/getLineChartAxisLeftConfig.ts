import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '@/page-layout/widgets/graph/utils/graphFormatters';

export const getLineChartAxisLeftConfig = (
  yAxisLabel?: string,
  formatOptions?: GraphValueFormatOptions,
  tickValues?: number[],
) => ({
  tickSize: 0,
  tickPadding: 5,
  tickRotation: 0,
  tickValues,
  legend: yAxisLabel,
  legendPosition: 'middle' as const,
  legendOffset: -50,
  format: (value: number) => formatGraphValue(value, formatOptions || {}),
});
