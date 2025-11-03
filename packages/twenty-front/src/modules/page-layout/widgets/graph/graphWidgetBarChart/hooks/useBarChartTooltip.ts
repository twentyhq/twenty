import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';
import { type BarChartEnrichedKey } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartEnrichedKey';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '@/page-layout/widgets/graph/utils/graphFormatters';
import { type BarDatum, type ComputedDatum } from '@nivo/bar';
import { isDefined } from 'twenty-shared/utils';

type UseBarChartTooltipProps = {
  enrichedKeys: BarChartEnrichedKey[];
  data: BarChartDataItem[];
  indexBy: string;
  formatOptions: GraphValueFormatOptions;
};

export const useBarChartTooltip = ({
  enrichedKeys,
  data,
  indexBy,
  formatOptions,
}: UseBarChartTooltipProps) => {
  const renderTooltip = (datum: ComputedDatum<BarDatum>) => {
    const dataItem = data.find((d) => d[indexBy] === datum.indexValue);

    const tooltipItems = enrichedKeys.map((enrichedKey) => {
      const seriesValue = Number(datum.data[enrichedKey.key] ?? 0);
      return {
        label: enrichedKey.label,
        formattedValue: formatGraphValue(seriesValue, formatOptions),
        dotColor: enrichedKey.colorScheme.solid,
      };
    });

    return {
      tooltipItems,
      showClickHint: isDefined(dataItem?.to),
      indexLabel: String(datum.indexValue),
    };
  };

  return { renderTooltip };
};
