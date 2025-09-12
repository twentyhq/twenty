import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '../../../utils/graphFormatters';

export const getChartBarAxisBottomConfig = (
  layout: 'vertical' | 'horizontal',
  xAxisLabel?: string,
  yAxisLabel?: string,
  formatOptions?: GraphValueFormatOptions,
) => {
  return layout === 'vertical'
    ? {
        tickSize: 0,
        tickPadding: 5,
        tickRotation: 0,
        legend: xAxisLabel,
        legendPosition: 'middle' as const,
        legendOffset: 40,
      }
    : {
        tickSize: 0,
        tickPadding: 5,
        tickRotation: 0,
        legend: yAxisLabel,
        legendPosition: 'middle' as const,
        legendOffset: 40,
        format: (value: number) => formatGraphValue(value, formatOptions || {}),
      };
};
