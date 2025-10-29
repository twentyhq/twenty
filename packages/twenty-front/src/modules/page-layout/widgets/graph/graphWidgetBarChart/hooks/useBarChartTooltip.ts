import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';
import { type BarChartEnrichedKey } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartEnrichedKey';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '@/page-layout/widgets/graph/utils/graphFormatters';
import { type BarDatum, type ComputedDatum } from '@nivo/bar';
import { isDefined } from 'twenty-shared/utils';

type UseBarChartTooltipProps = {
  hoveredBar: { key: string; indexValue: string | number } | null;
  enrichedKeys: BarChartEnrichedKey[];
  data: BarChartDataItem[];
  indexBy: string;
  formatOptions: GraphValueFormatOptions;
  enableGroupTooltip?: boolean;
};

export const useBarChartTooltip = ({
  hoveredBar,
  enrichedKeys,
  data,
  indexBy,
  formatOptions,
  enableGroupTooltip = true,
}: UseBarChartTooltipProps) => {
  const renderTooltip = (datum: ComputedDatum<BarDatum>) => {
    const dataItem = data.find((d) => d[indexBy] === datum.indexValue);

    if (enableGroupTooltip) {
      const tooltipItems = enrichedKeys
        .map((enrichedKey) => {
          const seriesValue = Number(datum.data[enrichedKey.key] || 0);
          return {
            label: enrichedKey.label,
            formattedValue: formatGraphValue(seriesValue, formatOptions),
            dotColor: enrichedKey.colorScheme.solid,
          };
        })
        .filter((item) => isDefined(item));

      return {
        tooltipItems,
        showClickHint: isDefined(dataItem?.to),
        indexLabel: String(datum.indexValue),
      };
    } else {
      const hoveredKey = hoveredBar?.key;
      if (!isDefined(hoveredKey)) return null;

      const enrichedKey = enrichedKeys.find((item) => item.key === hoveredKey);
      if (!enrichedKey) return null;

      const seriesValue = Number(datum.data[hoveredKey] || 0);
      const tooltipItem = {
        label: enrichedKey.label,
        formattedValue: formatGraphValue(seriesValue, formatOptions),
        dotColor: enrichedKey.colorScheme.solid,
      };

      return {
        tooltipItems: [tooltipItem],
        showClickHint: isDefined(dataItem?.to),
        indexLabel: String(datum.indexValue),
      };
    }
  };

  return { renderTooltip };
};
