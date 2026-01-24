import { type GraphWidgetTooltipItem } from '@/page-layout/widgets/graph/components/GraphWidgetTooltip';
import { type BarChartEnrichedKey } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartEnrichedKey';
import { type CanvasBarSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/findSliceAtCanvasPosition';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '@/page-layout/widgets/graph/utils/graphFormatters';

type GetCanvasBarChartTooltipDataParameters = {
  slice: CanvasBarSlice;
  data: Record<string, unknown>[];
  indexBy: string;
  enrichedKeys: BarChartEnrichedKey[];
  formatOptions: GraphValueFormatOptions;
};

type BarChartTooltipData = {
  tooltipItems: GraphWidgetTooltipItem[];
  indexLabel: string;
};

export const getCanvasBarChartTooltipData = ({
  slice,
  data,
  indexBy,
  enrichedKeys,
  formatOptions,
}: GetCanvasBarChartTooltipDataParameters): BarChartTooltipData | null => {
  if (slice.bars.length === 0) {
    return null;
  }

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
