import { type GraphWidgetLegendItem } from '@/page-layout/widgets/graph/components/GraphWidgetLegend';
import { type BarChartConfig } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartConfig';
import { type BarChartEnrichedKey } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartEnrichedKey';
import { type BarChartSeries } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSeries';
import { graphWidgetHiddenLegendIdsComponentState } from '@/page-layout/widgets/graph/states/graphWidgetHiddenLegendIdsComponentState';
import { type GraphColor } from '@/page-layout/widgets/graph/types/GraphColor';
import { type GraphColorRegistry } from '@/page-layout/widgets/graph/types/GraphColorRegistry';
import { getColorScheme } from '@/page-layout/widgets/graph/utils/getColorScheme';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { type BarDatum } from '@nivo/bar';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

type UseBarChartDataProps = {
  data: BarDatum[];
  indexBy: string;
  keys: string[];
  series?: BarChartSeries[];
  colorRegistry: GraphColorRegistry;
  seriesLabels?: Record<string, string>;
  groupMode?: 'grouped' | 'stacked';
};

export const useBarChartData = ({
  data,
  indexBy,
  keys,
  series,
  colorRegistry,
  seriesLabels,
}: UseBarChartDataProps) => {
  const hiddenLegendIds = useRecoilComponentValue(
    graphWidgetHiddenLegendIdsComponentState,
  );

  const seriesConfigMap = useMemo(
    () => new Map<string, BarChartSeries>(series?.map((s) => [s.key, s]) || []),
    [series],
  );

  const allEnrichedKeys: BarChartEnrichedKey[] = keys.map((key, index) => {
    const seriesConfig = seriesConfigMap.get(key);
    const hasExplicitColor = isDefined(seriesConfig?.color);
    const colorScheme = getColorScheme({
      registry: colorRegistry,
      colorName: seriesConfig?.color,
      fallbackIndex: index,
      totalGroups: hasExplicitColor ? undefined : keys.length,
    });

    return {
      key,
      colorScheme,
      label: seriesConfig?.label ?? seriesLabels?.[key] ?? key,
    };
  });

  const legendItems: GraphWidgetLegendItem[] = allEnrichedKeys.map((item) => ({
    id: item.key,
    label: item.label,
    color: item.colorScheme.solid,
  }));

  const visibleKeys = keys.filter((key) => !hiddenLegendIds.includes(key));

  const enrichedKeys = allEnrichedKeys.filter(
    (item) => !hiddenLegendIds.includes(item.key),
  );

  const barConfigs = useMemo((): BarChartConfig[] => {
    return data.flatMap((dataPoint) => {
      const indexValue = dataPoint[indexBy];
      const datumColor = dataPoint.color as GraphColor | undefined;

      return visibleKeys.flatMap((key): BarChartConfig[] => {
        const enrichedKey = allEnrichedKeys.find((ek) => ek.key === key);
        if (!isDefined(enrichedKey)) {
          return [];
        }

        const colorScheme = isDefined(datumColor)
          ? getColorScheme({
              registry: colorRegistry,
              colorName: datumColor,
            })
          : enrichedKey.colorScheme;

        return [
          {
            key,
            indexValue,
            colorScheme,
          },
        ];
      });
    });
  }, [data, indexBy, visibleKeys, allEnrichedKeys, colorRegistry]);

  return {
    seriesConfigMap,
    barConfigs,
    enrichedKeys,
    legendItems,
    visibleKeys,
  };
};
