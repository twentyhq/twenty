import { type GraphWidgetTooltipItem } from '@/page-layout/widgets/graph/components/GraphWidgetTooltip';
import { type BarChartEnrichedKey } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartEnrichedKey';
import { type BarChartSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSlice';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '@/page-layout/widgets/graph/utils/graphFormatters';
import { isDefined } from 'twenty-shared/utils';

type GetBarChartTooltipDataParameters = {
  slice: BarChartSlice;
  enrichedKeys: BarChartEnrichedKey[];
  formatOptions: GraphValueFormatOptions;
  layout?: 'vertical' | 'horizontal';
};

type BarChartTooltipData = {
  tooltipItems: GraphWidgetTooltipItem[];
  indexLabel: string;
};

export const getBarChartTooltipData = ({
  slice,
  enrichedKeys,
  formatOptions,
  layout = 'vertical',
}: GetBarChartTooltipDataParameters): BarChartTooltipData | null => {
  if (slice.bars.length === 0) {
    return null;
  }

  const firstBar = slice.bars[0];
  if (!isDefined(firstBar)) {
    return null;
  }

  const keysToProcess =
    layout === 'vertical' ? [...enrichedKeys].reverse() : enrichedKeys;

  const tooltipItems = keysToProcess.map((enrichedKey) => {
    const seriesValue = Number(firstBar.data.data[enrichedKey.key] ?? 0);
    return {
      key: enrichedKey.key,
      label: enrichedKey.label,
      formattedValue: formatGraphValue(seriesValue, formatOptions),
      value: seriesValue,
      dotColor: enrichedKey.colorScheme.solid,
    };
  });

  return {
    tooltipItems,
    indexLabel: slice.indexValue,
  };
};
