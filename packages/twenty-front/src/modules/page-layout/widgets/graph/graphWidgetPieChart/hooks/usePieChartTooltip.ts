import { type PieChartDataItem } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
import { type PieChartEnrichedData } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartEnrichedData';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '@/page-layout/widgets/graph/utils/graphFormatters';
import { type ComputedDatum } from '@nivo/pie';
import { isDefined } from 'twenty-shared/utils';

type UsePieChartTooltipProps = {
  enrichedData: PieChartEnrichedData[];
  data: PieChartDataItem[];
  formatOptions: GraphValueFormatOptions;
  displayType?: string;
};

export const usePieChartTooltip = ({
  enrichedData,
  data,
  formatOptions,
  displayType,
}: UsePieChartTooltipProps) => {
  const createTooltipData = (
    datum: ComputedDatum<{ id: string; value: number; label?: string }>,
  ) => {
    const item = enrichedData.find((d) => d.id === datum.id);
    if (!isDefined(item)) return null;

    const dataItem = data.find((d) => d.id === datum.id);

    const formattedValue =
      displayType === 'percentage'
        ? formatGraphValue(item.percentage / 100, formatOptions)
        : `${formatGraphValue(item.value, formatOptions)} (${item.percentage.toFixed(1)}%)`;

    return {
      tooltipItem: {
        label: item.label || item.id,
        formattedValue,
        value: item.value,
        dotColor: item.colorScheme.solid,
      },
      showClickHint: isDefined(dataItem?.to),
    };
  };

  return {
    createTooltipData,
  };
};
