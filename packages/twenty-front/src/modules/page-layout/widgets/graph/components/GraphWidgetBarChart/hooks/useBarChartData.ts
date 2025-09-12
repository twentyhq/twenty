import { useMemo } from 'react';
import { type GraphColorRegistry } from '../../../types/GraphColorRegistry';
import { getColorScheme } from '../../../utils/getColorScheme';
import { createGradientDef } from '../../../utils/createGradientDef';
import { type BarChartDataItem } from '../types/BarChartDataItem';
import { type BarChartSeries } from '../types/BarChartSeries';
import { type BarChartConfig } from '../types/BarChartConfig';
import { type BarChartEnrichedKey } from '../types/BarChartEnrichedKey';

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
  const seriesConfigMap = useMemo(() => {
    const map = new Map<string, BarChartSeries>();
    series?.forEach((s) => map.set(s.key, s));
    return map;
  }, [series]);

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
    defs,
  };
};
