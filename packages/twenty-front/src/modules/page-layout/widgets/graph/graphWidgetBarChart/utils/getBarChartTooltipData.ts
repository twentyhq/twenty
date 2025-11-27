import { type GraphWidgetTooltipItem } from '@/page-layout/widgets/graph/components/GraphWidgetTooltip';
import { type BarChartEnrichedKey } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartEnrichedKey';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '@/page-layout/widgets/graph/utils/graphFormatters';
import { type BarDatum, type ComputedDatum } from '@nivo/bar';
import { isDefined } from 'twenty-shared/utils';

type GetBarChartTooltipDataParameters = {
  datum: ComputedDatum<BarDatum>;
  enrichedKeys: BarChartEnrichedKey[];
  formatOptions: GraphValueFormatOptions;
  enableGroupTooltip?: boolean;
  layout?: 'vertical' | 'horizontal';
};

type BarChartTooltipData = {
  tooltipItems: GraphWidgetTooltipItem[];
  indexLabel: string;
  hoveredKey: string | undefined;
};

export const getBarChartTooltipData = ({
  datum,
  enrichedKeys,
  formatOptions,
  enableGroupTooltip = true,
  layout = 'vertical',
}: GetBarChartTooltipDataParameters): BarChartTooltipData | null => {
  let keysToShow: BarChartEnrichedKey[];

  if (enableGroupTooltip) {
    keysToShow = enrichedKeys;
  } else {
    const hoveredKey = datum.id;
    if (!isDefined(hoveredKey)) return null;

    const enrichedKey = enrichedKeys.find(
      (item) => item.key === String(hoveredKey),
    );
    if (!isDefined(enrichedKey)) return null;

    keysToShow = [enrichedKey];
  }

  const keysToProcess =
    layout === 'vertical' ? [...keysToShow].reverse() : keysToShow;

  const tooltipItems = keysToProcess.map((enrichedKey) => {
    const seriesValue = Number(datum.data[enrichedKey.key] ?? 0);
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
    indexLabel: String(datum.indexValue),
    hoveredKey: enableGroupTooltip ? String(datum.id) : undefined,
  };
};
