import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '../../../utils/graphFormatters';

export const getAxisLeftConfig = (
  yAxisLabel?: string,
  formatOptions?: GraphValueFormatOptions,
) => ({
  tickSize: 0,
  tickPadding: 5,
  tickRotation: 0,
  legend: yAxisLabel,
  legendPosition: 'middle' as const,
  legendOffset: -50,
  format: (value: number) => formatGraphValue(value, formatOptions || {}),
});
