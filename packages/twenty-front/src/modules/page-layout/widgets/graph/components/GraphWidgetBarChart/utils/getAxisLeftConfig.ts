import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '../../../utils/graphFormatters';

export const getAxisLeftConfig = (
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
        legend: yAxisLabel,
        legendPosition: 'middle' as const,
        legendOffset: -50,
        format: (value: number) => formatGraphValue(value, formatOptions || {}),
      }
    : {
        tickSize: 0,
        tickPadding: 5,
        tickRotation: 0,
        legend: xAxisLabel,
        legendPosition: 'middle' as const,
        legendOffset: -50,
      };
};
