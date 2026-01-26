import { type GraphWidgetTooltipItem } from '@/page-layout/widgets/graph/components/GraphWidgetTooltip';
import { type BarChartEnrichedKey } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartEnrichedKey';
import { type BarChartSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSlice';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '@/page-layout/widgets/graph/utils/graphFormatters';

type GetBarChartTooltipDataParameters = {
  slice: BarChartSlice;
  data: Record<string, unknown>[];
  indexBy: string;
  enrichedKeys: BarChartEnrichedKey[];
  formatOptions: GraphValueFormatOptions;
};

type BarChartTooltipData = {
  tooltipItems: GraphWidgetTooltipItem[];
  indexLabel: string;
};

export const getBarChartTooltipData = ({
  slice,
  data,
  indexBy,
  enrichedKeys,
  formatOptions,
}: GetBarChartTooltipDataParameters): BarChartTooltipData | null => {
  const dataRow = data.find(
    (row) => String(row[indexBy]) === slice.indexValue,
  );

  if (!dataRow) {
    return null;
  }

  const tooltipItems = enrichedKeys.map((enrichedKey) => {
    const seriesValue = Number(dataRow[enrichedKey.key] ?? 0);
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
