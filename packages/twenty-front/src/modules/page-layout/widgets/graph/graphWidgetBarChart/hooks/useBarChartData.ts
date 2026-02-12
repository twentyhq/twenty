import { type GraphWidgetLegendItem } from '@/page-layout/widgets/graph/components/GraphWidgetLegend';
import { type BarChartEnrichedKey } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartEnrichedKey';
import { type BarChartSeriesWithColor } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSeries';
import { graphWidgetHiddenLegendIdsComponentState } from '@/page-layout/widgets/graph/states/graphWidgetHiddenLegendIdsComponentState';
import { type GraphColorMode } from '@/page-layout/widgets/graph/types/GraphColorMode';
import { type GraphColorRegistry } from '@/page-layout/widgets/graph/types/GraphColorRegistry';
import { getColorScheme } from '@/page-layout/widgets/graph/utils/getColorScheme';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useMemo } from 'react';

type UseBarChartDataProps = {
  keys: string[];
  series?: BarChartSeriesWithColor[];
  colorRegistry: GraphColorRegistry;
  seriesLabels?: Record<string, string>;
  groupMode?: 'grouped' | 'stacked';
  colorMode: GraphColorMode;
};

export const useBarChartData = ({
  keys,
  series,
  colorRegistry,
  seriesLabels,
  colorMode,
}: UseBarChartDataProps) => {
  const hiddenLegendIds = useRecoilComponentValue(
    graphWidgetHiddenLegendIdsComponentState,
  );

  const seriesConfigMap = useMemo(
    () =>
      new Map<string, BarChartSeriesWithColor>(
        series?.map((s) => [s.key, s]) || [],
      ),
    [series],
  );

  const allEnrichedKeys = useMemo((): BarChartEnrichedKey[] => {
    const shouldApplyGradient = colorMode === 'explicitSingleColor';

    return keys.map((key, index) => {
      const seriesConfig = seriesConfigMap.get(key);
      const colorScheme = getColorScheme({
        registry: colorRegistry,
        colorName: seriesConfig?.color,
        fallbackIndex: index,
        totalGroups: shouldApplyGradient ? keys.length : undefined,
      });

      return {
        key,
        colorScheme,
        label: seriesConfig?.label ?? seriesLabels?.[key] ?? key,
      };
    });
  }, [keys, seriesConfigMap, colorRegistry, seriesLabels, colorMode]);

  const legendItems: GraphWidgetLegendItem[] = allEnrichedKeys.map((item) => ({
    id: item.key,
    label: item.label,
    color: item.colorScheme.solid,
  }));

  const visibleKeys = keys.filter((key) => !hiddenLegendIds.includes(key));

  const enrichedKeys = allEnrichedKeys.filter(
    (item) => !hiddenLegendIds.includes(item.key),
  );

  const enrichedKeysMap = useMemo(
    () => new Map(allEnrichedKeys.map((ek) => [ek.key, ek])),
    [allEnrichedKeys],
  );

  return {
    seriesConfigMap,
    enrichedKeysMap,
    enrichedKeys,
    legendItems,
    visibleKeys,
  };
};
