import { type LineChartEnrichedSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartEnrichedSeries';
import { type LineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeries';
import { type GraphColorRegistry } from '@/page-layout/widgets/graph/types/GraphColorRegistry';
import { createGradientDef } from '@/page-layout/widgets/graph/utils/createGradientDef';
import { getColorScheme } from '@/page-layout/widgets/graph/utils/getColorScheme';
import { type LineSeries } from '@nivo/line';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type ThemeType } from 'twenty-ui/theme';

type UseLineChartDataProps = {
  data: LineChartSeries[];
  colorRegistry: GraphColorRegistry;
  id: string;
  instanceId: string;
  enableArea: boolean;
  theme: ThemeType;
};

export const useLineChartData = ({
  data,
  colorRegistry,
  id,
  instanceId,
  enableArea,
  theme,
}: UseLineChartDataProps) => {
  const dataMap = Object.fromEntries(data.map((series) => [series.id, series]));
  const enrichedSeries = useMemo((): LineChartEnrichedSeries[] => {
    return data.map((series, index) => {
      const colorScheme = getColorScheme({
        registry: colorRegistry,
        colorName: series.color,
        fallbackIndex: index,
        totalGroups: data.length,
      });
      const shouldEnableArea = series.enableArea ?? enableArea;
      const gradientId = `lineGradient-${id}-${instanceId}-${series.id}-${index}`;

      return {
        ...series,
        colorScheme,
        gradientId,
        shouldEnableArea,
        label: series.label || series.id,
      };
    });
  }, [data, colorRegistry, id, instanceId, enableArea]);

  const nivoData: LineSeries[] = data.map((series) => ({
    id: series.id,
    data: series.data.map((point) => ({
      x: point.x,
      y: point.y,
    })),
  }));

  const seriesWithArea = enrichedSeries.filter(
    (series) => series.shouldEnableArea,
  );

  const defs = seriesWithArea.map((series) =>
    createGradientDef(
      series.colorScheme,
      series.gradientId,
      false,
      90,
      theme.name === 'light',
    ),
  );

  const fill = seriesWithArea.map((series) => ({
    match: { id: series.id },
    id: series.gradientId,
  }));

  const colors = enrichedSeries.map((series) => series.colorScheme.solid);

  const legendItems = enrichedSeries.map((series) => {
    return {
      id: series.id,
      label: series.label,
      color: series.colorScheme.solid,
    };
  });

  const hasClickableItems = data.some((series) =>
    series.data.some((point) => isDefined(point.to)),
  );

  return {
    dataMap,
    enrichedSeries,
    nivoData,
    defs,
    fill,
    colors,
    legendItems,
    hasClickableItems,
  };
};
