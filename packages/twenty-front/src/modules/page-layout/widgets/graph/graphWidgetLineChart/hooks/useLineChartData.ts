import { type LineChartEnrichedSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartEnrichedSeries';
import { type LineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeries';
import { type GraphColorRegistry } from '@/page-layout/widgets/graph/types/GraphColorRegistry';
import { getColorScheme } from '@/page-layout/widgets/graph/utils/getColorScheme';
import { type LineSeries } from '@nivo/line';
import { useMemo } from 'react';

type UseLineChartDataProps = {
  data: LineChartSeries[];
  colorRegistry: GraphColorRegistry;
};

export const useLineChartData = ({
  data,
  colorRegistry,
}: UseLineChartDataProps) => {
  const enrichedSeries = useMemo((): LineChartEnrichedSeries[] => {
    return data.map((series, index) => {
      const colorScheme = getColorScheme({
        registry: colorRegistry,
        colorName: series.color,
        fallbackIndex: index,
        totalGroups: data.length,
      });

      return {
        ...series,
        colorScheme,
        label: series.label || series.id,
      };
    });
  }, [data, colorRegistry]);

  const nivoData: LineSeries[] = data.map((series) => ({
    id: series.id,
    data: series.data.map((point) => ({
      x: point.x,
      y: point.y,
    })),
  }));

  const colors = enrichedSeries.map((series) => series.colorScheme.solid);

  const legendItems = enrichedSeries.map((series) => {
    return {
      id: series.id,
      label: series.label,
      color: series.colorScheme.solid,
    };
  });

  return {
    enrichedSeries,
    nivoData,
    colors,
    legendItems,
  };
};
