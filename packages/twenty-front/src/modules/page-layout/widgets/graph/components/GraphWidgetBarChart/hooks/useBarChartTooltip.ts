import { type ComputedDatum, type BarDatum } from '@nivo/bar';
import { isDefined } from 'twenty-shared/utils';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '../../../utils/graphFormatters';
import { type BarChartDataItem } from '../types/BarChartDataItem';
import { type BarChartEnrichedKey } from '../types/BarChartEnrichedKey';

type UseBarChartTooltipProps = {
  hoveredBar: { key: string; indexValue: string | number } | null;
  enrichedKeys: BarChartEnrichedKey[];
  data: BarChartDataItem[];
  indexBy: string;
  formatOptions: GraphValueFormatOptions;
};

export const useBarChartTooltip = ({
  hoveredBar,
  enrichedKeys,
  data,
  indexBy,
  formatOptions,
}: UseBarChartTooltipProps) => {
  const renderTooltip = (datum: ComputedDatum<BarDatum>) => {
    const hoveredKey = hoveredBar?.key;
    if (!isDefined(hoveredKey)) return null;

    const enrichedKey = enrichedKeys.find((item) => item.key === hoveredKey);
    if (!enrichedKey) return null;

    const dataItem = data.find((d) => d[indexBy] === datum.indexValue);
    const seriesValue = Number(datum.data[hoveredKey] || 0);
    const tooltipItem = {
      label: enrichedKey.label,
      formattedValue: formatGraphValue(seriesValue, formatOptions),
      dotColor: enrichedKey.colorScheme.solid,
    };

    return {
      tooltipItem,
      showClickHint: isDefined(dataItem?.to),
    };
  };

  return { renderTooltip };
};
