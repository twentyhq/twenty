import { type WaffleChartEnrichedData } from '@/page-layout/widgets/graph/graphWidgetWaffleChart/types/WaffleChartEnrichedData';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '@/page-layout/widgets/graph/utils/graphFormatters';
import { type ComputedDatum } from '@nivo/waffle';
import { isDefined } from 'twenty-shared/utils';

type UseWaffleChartTooltipProps = {
  enrichedData: WaffleChartEnrichedData[];
  formatOptions: GraphValueFormatOptions;
  displayType?: string;
};

export const useWaffleChartTooltip = ({
  enrichedData,
  formatOptions,
  displayType,
}: UseWaffleChartTooltipProps) => {
  const createTooltipData = (
    datum: ComputedDatum<{ id: string; value: number; label: string }>,
  ) => {
    const item = enrichedData.find(
      (enrichedDataItem) => enrichedDataItem.id === datum.id,
    );
	if (!item) {
    // fallback if no enriched data match
    return {
      tooltipItem: {
        key: String(datum.id),
        label: datum.label ?? String(datum.id),
        formattedValue: formatGraphValue(datum.value, formatOptions),
        value: datum.value,
        dotColor: datum.color,
      },
    };
  }

    const formattedValue =
      displayType === 'percentage'
        ? formatGraphValue(item.percentage / 100, formatOptions)
        : `${formatGraphValue(item.value, formatOptions)} (${item.percentage.toFixed(1)}%)`;

    return {
      tooltipItem: {
        key: item.id,
        label: datum.label ?? item.id,
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
