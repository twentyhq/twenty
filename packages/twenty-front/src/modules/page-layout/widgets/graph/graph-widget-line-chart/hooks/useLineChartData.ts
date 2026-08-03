import { type GraphWidgetLegendItem } from '@/page-layout/widgets/graph/components/GraphWidgetLegend';
import { type LineChartEnrichedSeries } from '@/page-layout/widgets/graph/graph-widget-line-chart/types/LineChartEnrichedSeries';
import { type LineChartSeriesWithColor } from '@/page-layout/widgets/graph/graph-widget-line-chart/types/LineChartSeriesWithColor';
import { graphWidgetHiddenLegendIdsComponentState } from '@/page-layout/widgets/graph/states/graphWidgetHiddenLegendIdsComponentState';
import { type GraphColorMode } from '@/page-layout/widgets/graph/types/GraphColorMode';
import { type GraphColorRegistry } from '@/page-layout/widgets/graph/types/GraphColorRegistry';
import { buildAlphabeticalRankByKey } from '@/page-layout/widgets/graph/utils/buildAlphabeticalRankByKey';
import { getColorScheme } from '@/page-layout/widgets/graph/utils/getColorScheme';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { type LineSeries } from '@nivo/line';
import { useMemo } from 'react';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

type UseLineChartDataProps = {
  data: LineChartSeriesWithColor[];
  colorRegistry: GraphColorRegistry;
  id: string;
  colorMode: GraphColorMode;
};

export const useLineChartData = ({
  data,
  colorRegistry,
  id,
  colorMode,
}: UseLineChartDataProps) => {
  const graphWidgetHiddenLegendIds = useAtomComponentStateValue(
    graphWidgetHiddenLegendIdsComponentState,
  );

  const allEnrichedSeries = useMemo((): LineChartEnrichedSeries[] => {
    const alphabeticalRankByKey = buildAlphabeticalRankByKey(
      data.map((series) => series.key),
    );

    return data.map((series, index) => {
      const alphabeticalRank = alphabeticalRankByKey.get(series.key);

      assertIsDefinedOrThrow(
        alphabeticalRank,
        new Error(`Missing alphabetical rank for color key "${series.key}"`),
      );

      const colorScheme = getColorScheme({
        registry: colorRegistry,
        colorName: series.color,
        colorIndex: alphabeticalRank,
        totalGroups:
          colorMode === 'explicitSingleColor'
            ? alphabeticalRankByKey.size
            : undefined,
      });

      const sanitizedSeriesKey = series.key
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_-]/g, '');
      const areaFillId = `areaFill-${id}-${sanitizedSeriesKey}-${index}`;

      return { ...series, colorScheme, areaFillId };
    });
  }, [data, colorRegistry, id, colorMode]);

  const legendItems: GraphWidgetLegendItem[] = allEnrichedSeries.map(
    (series) => ({
      id: series.key,
      label: series.label,
      color: series.colorScheme.solid,
    }),
  );

  const visibleData = data.filter(
    (series) => !graphWidgetHiddenLegendIds.includes(series.key),
  );

  const enrichedSeries = allEnrichedSeries.filter(
    (series) => !graphWidgetHiddenLegendIds.includes(series.key),
  );

  const nivoData: LineSeries[] = visibleData.map((series) => ({
    id: series.key,
    data: series.data.map((point) => ({ x: point.x, y: point.y })),
  }));

  const colors: string[] = enrichedSeries.map(
    (series) => series.colorScheme.solid,
  );

  return { enrichedSeries, nivoData, colors, legendItems, visibleData };
};
