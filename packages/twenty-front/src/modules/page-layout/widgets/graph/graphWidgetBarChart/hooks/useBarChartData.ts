import { type BarChartConfig } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartConfig';
import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';
import { type BarChartEnrichedKey } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartEnrichedKey';
import { type BarChartSeries } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSeries';
import { type GraphColorRegistry } from '@/page-layout/widgets/graph/types/GraphColorRegistry';
import { getColorScheme } from '@/page-layout/widgets/graph/utils/getColorScheme';
import { useMemo } from 'react';

type UseBarChartDataProps = {
  data: BarChartDataItem[];
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
  const seriesConfigMap = useMemo(
    () => new Map<string, BarChartSeries>(series?.map((s) => [s.key, s]) || []),
    [series],
  );

  const barConfigs = useMemo((): BarChartConfig[] => {
    return data.flatMap((dataPoint) => {
      const indexValue = dataPoint[indexBy];
      return keys.map((key, keyIndex): BarChartConfig => {
        const seriesConfig = seriesConfigMap.get(key);
        const colorScheme = getColorScheme({
          registry: colorRegistry,
          colorName: seriesConfig?.color,
          fallbackIndex: keyIndex,
          totalGroups: keys.length,
        });

        return {
          key,
          indexValue,
          colorScheme,
        };
      });
    });
  }, [data, indexBy, keys, colorRegistry, seriesConfigMap]);

  const enrichedKeys: BarChartEnrichedKey[] = keys.map((key, index) => {
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
      label: seriesConfig?.label || seriesLabels?.[key] || key,
    };
  });

  return {
    seriesConfigMap,
    barConfigs,
    enrichedKeys,
  };
};
