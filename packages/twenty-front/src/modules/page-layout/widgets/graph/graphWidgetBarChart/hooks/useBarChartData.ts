import { type GraphWidgetLegendItem } from '@/page-layout/widgets/graph/components/GraphWidgetLegend';
import { type BarChartConfig } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartConfig';
import { type BarChartEnrichedKey } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartEnrichedKey';
import { type BarChartSeries } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSeries';
import { graphWidgetHiddenLegendIdsComponentState } from '@/page-layout/widgets/graph/states/graphWidgetHiddenLegendIdsComponentState';
import { type GraphColorRegistry } from '@/page-layout/widgets/graph/types/GraphColorRegistry';
import { getColorScheme } from '@/page-layout/widgets/graph/utils/getColorScheme';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { type BarDatum } from '@nivo/bar';
import { useMemo } from 'react';

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

  const allEnrichedKeys = useMemo(
    (): BarChartEnrichedKey[] =>
      keys.map((key, index) => {
        const seriesConfig = seriesConfigMap.get(key);
        const colorScheme = getColorScheme({
          registry: colorRegistry,
          colorName: seriesConfig?.color,
          fallbackIndex: index,
          totalGroups: keys.length,
        });

        return {
          key,
          colorScheme,
          label: seriesConfig?.label ?? seriesLabels?.[key] ?? key,
        };
      }),
    [keys, colorRegistry, seriesConfigMap, seriesLabels],
  );

  const legendItems = useMemo(
    (): GraphWidgetLegendItem[] =>
      allEnrichedKeys.map((item) => ({
        id: item.key,
        label: item.label,
        color: item.colorScheme.solid,
      })),
    [allEnrichedKeys],
  );

  const visibleKeys = useMemo(
    () => keys.filter((key) => !hiddenLegendIds.includes(key)),
    [keys, hiddenLegendIds],
  );

  const enrichedKeys = useMemo(
    () => allEnrichedKeys.filter((item) => !hiddenLegendIds.includes(item.key)),
    [allEnrichedKeys, hiddenLegendIds],
  );

  const barConfigs = useMemo((): BarChartConfig[] => {
    return data.flatMap((dataPoint) => {
      const indexValue = dataPoint[indexBy];
      return visibleKeys.map((key): BarChartConfig => {
        const enrichedKey = allEnrichedKeys.find((ek) => ek.key === key);
        return {
          key,
          indexValue,
          colorScheme: enrichedKey!.colorScheme,
        };
      });
    });
  }, [data, indexBy, visibleKeys, allEnrichedKeys]);

  return {
    seriesConfigMap,
    barConfigs,
    enrichedKeys,
    legendItems,
    visibleKeys,
  };
};
