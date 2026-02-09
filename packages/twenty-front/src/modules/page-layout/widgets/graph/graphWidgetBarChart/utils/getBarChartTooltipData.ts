import { type GraphWidgetTooltipItem } from '@/page-layout/widgets/graph/components/GraphWidgetTooltip';
import { type BarChartDatum } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDatum';
import { type BarChartEnrichedKey } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartEnrichedKey';
import { type BarChartSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSlice';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '@/page-layout/widgets/graph/utils/graphFormatters';

type GetBarChartTooltipDataParameters = {
  slice: BarChartSlice;
  dataByIndexValue: Map<string, BarChartDatum>;
  enrichedKeys: BarChartEnrichedKey[];
  formatOptions: GraphValueFormatOptions;
};

type BarChartTooltipData = {
  tooltipItems: GraphWidgetTooltipItem[];
  indexLabel: string;
};

export const getBarChartTooltipData = ({
  slice,
  dataByIndexValue,
  enrichedKeys,
  formatOptions,
}: GetBarChartTooltipDataParameters): BarChartTooltipData | null => {
  const dataRow = dataByIndexValue.get(slice.indexValue);

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
