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
  const renderTooltip = (
    datum: ComputedDatum<{ id: string; value: number; label?: string }>,
  ) => {
    const item = enrichedData.find((d) => d.id === datum.id);
    if (!isDefined(item)) return null;

    const dataItem = data.find((d) => d.id === datum.id);
    const formattedValue = formatGraphValue(
      displayType === 'percentage' ? item.percentage / 100 : item.value,
      formatOptions,
    );
    const formattedWithPercentage = `${formattedValue} (${item.percentage.toFixed(1)}%)`;

    return {
      tooltipItem: {
        label: item.label || item.id,
        formattedValue: formattedWithPercentage,
        dotColor: item.colorScheme.solid,
      },
      showClickHint: isDefined(dataItem?.to),
    };
  };

  return {
    renderTooltip,
  };
};
