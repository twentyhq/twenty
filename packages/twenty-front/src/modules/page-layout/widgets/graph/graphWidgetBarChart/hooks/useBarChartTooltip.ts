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
  enableGroupTooltip?: boolean;
};

export const useBarChartTooltip = ({
  enrichedKeys,
  data,
  indexBy,
  formatOptions,
  enableGroupTooltip = true,
}: UseBarChartTooltipProps) => {
  const renderTooltip = (datum: ComputedDatum<BarDatum>) => {
    const dataItem = data.find(
      (dataRow) => dataRow[indexBy] === datum.indexValue,
    );

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

    const tooltipItems = keysToShow.map((enrichedKey) => {
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
      showClickHint: isDefined(dataItem?.to),
      indexLabel: String(datum.indexValue),
      hoveredKey: enableGroupTooltip ? String(datum.id) : undefined,
      linkTo: isDefined(dataItem?.to) ? String(dataItem.to) : undefined,
    };
  };

  return { renderTooltip };
};
