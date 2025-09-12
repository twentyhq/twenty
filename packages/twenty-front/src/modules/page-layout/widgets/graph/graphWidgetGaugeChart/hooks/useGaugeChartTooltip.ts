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
  const renderTooltip = () => {
    const formattedValue = formatGraphValue(value, formatOptions);
    const formattedWithPercentage = `${formattedValue} (${normalizedValue.toFixed(1)}%)`;

    return {
      tooltipItem: {
        label: label,
        formattedValue: formattedWithPercentage,
        dotColor: colorScheme.solid,
      },
      showClickHint: isDefined(to),
    };
  };

  return {
    renderTooltip,
  };
};
