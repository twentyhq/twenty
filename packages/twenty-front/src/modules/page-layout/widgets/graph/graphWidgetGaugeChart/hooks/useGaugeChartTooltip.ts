import { type GraphColorScheme } from '@/page-layout/widgets/graph/types/GraphColorScheme';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '@/page-layout/widgets/graph/utils/graphFormatters';
import { isDefined } from 'twenty-shared/utils';

type UseGaugeChartTooltipProps = {
  value: number;
  normalizedValue: number;
  label: string;
  colorScheme: GraphColorScheme;
  formatOptions: GraphValueFormatOptions;
  to?: string;
};

export const useGaugeChartTooltip = ({
  value,
  normalizedValue,
  label,
  colorScheme,
  formatOptions,
  to,
}: UseGaugeChartTooltipProps) => {
  const createTooltipData = () => {
    // Format value based on display type to avoid redundant percentage display
    const formattedValue =
      formatOptions?.displayType === 'percentage'
        ? formatGraphValue(normalizedValue / 100, formatOptions)
        : `${formatGraphValue(value, formatOptions)} (${normalizedValue.toFixed(1)}%)`;

    return {
      tooltipItem: {
        label: label,
        formattedValue,
        value,
        dotColor: colorScheme.solid,
      },
      showClickHint: isDefined(to),
    };
  };

  return {
    createTooltipData,
  };
};
