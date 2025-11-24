import { type GraphColorScheme } from '@/page-layout/widgets/graph/types/GraphColorScheme';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '@/page-layout/widgets/graph/utils/graphFormatters';

type UseGaugeChartTooltipProps = {
  value: number;
  normalizedValue: number;
  label: string;
  colorScheme: GraphColorScheme;
  formatOptions: GraphValueFormatOptions;
};

export const useGaugeChartTooltip = ({
  value,
  normalizedValue,
  label,
  colorScheme,
  formatOptions,
}: UseGaugeChartTooltipProps) => {
  const createTooltipData = () => {
    // Format value based on display type to avoid redundant percentage display
    const formattedValue =
      formatOptions?.displayType === 'percentage'
        ? formatGraphValue(normalizedValue / 100, formatOptions)
        : `${formatGraphValue(value, formatOptions)} (${normalizedValue.toFixed(1)}%)`;

    return {
      tooltipItem: {
        // TODO: temporary use label as key, ideally key should be unique id -- change when we work on gauge
        key: label,
        label: label,
        formattedValue,
        value,
        dotColor: colorScheme.solid,
      },
    };
  };

  return {
    createTooltipData,
  };
};
