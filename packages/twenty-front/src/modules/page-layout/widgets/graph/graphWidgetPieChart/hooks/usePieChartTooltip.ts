import { type PieChartEnrichedData } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartEnrichedData';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '@/page-layout/widgets/graph/utils/graphFormatters';
import { type ComputedDatum } from '@nivo/pie';
import { isDefined } from 'twenty-shared/utils';

type UsePieChartTooltipProps = {
  enrichedData: PieChartEnrichedData[];
  formatOptions: GraphValueFormatOptions;
  displayType?: string;
};

export const usePieChartTooltip = ({
  enrichedData,
  formatOptions,
  displayType,
}: UsePieChartTooltipProps) => {
  const createTooltipData = (
    datum: ComputedDatum<{ id: string; value: number; label?: string }>,
  ) => {
    const item = enrichedData.find(
      (enrichedDataItem) => enrichedDataItem.id === datum.id,
    );
    if (!isDefined(item)) return null;

    const formattedValue =
      displayType === 'percentage'
        ? formatGraphValue(item.percentage / 100, formatOptions)
        : `${formatGraphValue(item.value, formatOptions)} (${item.percentage.toFixed(1)}%)`;

    return {
      tooltipItem: {
        key: item.id,
        label: item.id,
        formattedValue,
        value: item.value,
        dotColor: item.colorScheme.solid,
      },
    };
  };

  return {
    createTooltipData,
  };
};
