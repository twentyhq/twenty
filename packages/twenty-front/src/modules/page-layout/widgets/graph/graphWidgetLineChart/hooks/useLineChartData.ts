import { type GraphWidgetLegendItem } from '@/page-layout/widgets/graph/components/GraphWidgetLegend';
import { type LineChartEnrichedSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartEnrichedSeries';
import { type LineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeries';
import { graphWidgetHiddenLegendIdsComponentState } from '@/page-layout/widgets/graph/states/graphWidgetHiddenLegendIdsComponentState';
import { type GraphColorRegistry } from '@/page-layout/widgets/graph/types/GraphColorRegistry';
import { getColorScheme } from '@/page-layout/widgets/graph/utils/getColorScheme';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { type LineSeries } from '@nivo/line';
import { useMemo } from 'react';

type UseLineChartDataProps = {
  data: LineChartSeries[];
  colorRegistry: GraphColorRegistry;
  id: string;
};

export const useLineChartData = ({
  data,
  colorRegistry,
  id,
}: UseLineChartDataProps) => {
  const hiddenLegendIds = useRecoilComponentValue(
    graphWidgetHiddenLegendIdsComponentState,
  );

  const allEnrichedSeries = useMemo((): LineChartEnrichedSeries[] => {
    return data.map((series, index) => {
      const colorScheme = getColorScheme({
        registry: colorRegistry,
        colorName: series.color,
        fallbackIndex: index,
        totalGroups: data.length,
      });

      const sanitizedSeriesId = series.id
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_-]/g, '');
      const areaFillId = `areaFill-${id}-${sanitizedSeriesId}-${index}`;
      const label = series.label ?? series.id;

      return { ...series, colorScheme, areaFillId, label };
    });
  }, [data, colorRegistry, id]);

  const legendItems: GraphWidgetLegendItem[] = allEnrichedSeries.map(
    (series) => ({
      id: series.id,
      label: series.label,
      color: series.colorScheme.solid,
    }),
  );

  const visibleData = data.filter(
    (series) => !hiddenLegendIds.includes(series.id),
  );

  const enrichedSeries = allEnrichedSeries.filter(
    (series) => !hiddenLegendIds.includes(series.id),
  );

  const nivoData: LineSeries[] = visibleData.map((series) => ({
    id: series.id,
    data: series.data.map((point) => ({ x: point.x, y: point.y })),
  }));

  const colors: string[] = enrichedSeries.map(
    (series) => series.colorScheme.solid,
  );

  return { enrichedSeries, nivoData, colors, legendItems, visibleData };
};
