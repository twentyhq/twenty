import { type BarChartConfig } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartConfig';
import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';
import { type BarChartEnrichedKey } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartEnrichedKey';
import { type BarChartSeries } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSeries';
import { type GraphColorRegistry } from '@/page-layout/widgets/graph/types/GraphColorRegistry';
import { createGradientDef } from '@/page-layout/widgets/graph/utils/createGradientDef';
import { getColorScheme } from '@/page-layout/widgets/graph/utils/getColorScheme';
import { useMemo } from 'react';

type UseBarChartDataProps = {
  data: BarChartDataItem[];
  indexBy: string;
  keys: string[];
  series?: BarChartSeries[];
  colorRegistry: GraphColorRegistry;
  id: string;
  instanceId: string;
  seriesLabels?: Record<string, string>;
  hoveredBar: { key: string; indexValue: string | number } | null;
  layout: 'vertical' | 'horizontal';
};

export const useBarChartData = ({
  data,
  indexBy,
  keys,
  series,
  colorRegistry,
  id,
  instanceId,
  seriesLabels,
  hoveredBar,
  layout,
}: UseBarChartDataProps) => {
  const seriesConfigMap = useMemo(
    () => new Map<string, BarChartSeries>(series?.map((s) => [s.key, s]) || []),
    [series],
  );

  const barConfigs = useMemo((): BarChartConfig[] => {
    return data.flatMap((dataPoint, dataIndex) => {
      const indexValue = dataPoint[indexBy];
      return keys.map((key, keyIndex): BarChartConfig => {
        const seriesConfig = seriesConfigMap.get(key);
        const colorScheme = getColorScheme(
          colorRegistry,
          seriesConfig?.color,
          keyIndex,
        );
        const gradientId = `gradient-${id}-${instanceId}-${key}-${dataIndex}-${keyIndex}`;

        return {
          key,
          indexValue,
          gradientId,
          colorScheme,
        };
      });
    });
  }, [data, indexBy, keys, colorRegistry, id, instanceId, seriesConfigMap]);

  const enrichedKeys: BarChartEnrichedKey[] = keys.map((key, index) => {
    const seriesConfig = seriesConfigMap.get(key);
    const colorScheme = getColorScheme(
      colorRegistry,
      seriesConfig?.color,
      index,
    );
    return {
      key,
      colorScheme,
      label: seriesConfig?.label || seriesLabels?.[key] || key,
    };
  });

  const enrichedKeysMap = useMemo(
    () => new Map(enrichedKeys.map((item) => [item.key, item])),
    [enrichedKeys],
  );

  const defs = barConfigs.map((bar) => {
    const isHovered =
      hoveredBar?.key === bar.key && hoveredBar?.indexValue === bar.indexValue;
    return createGradientDef(
      bar.colorScheme,
      bar.gradientId,
      isHovered,
      layout === 'horizontal' ? 0 : 90,
      true,
    );
  });

  return {
    seriesConfigMap,
    barConfigs,
    enrichedKeys,
    enrichedKeysMap,
    defs,
  };
};
