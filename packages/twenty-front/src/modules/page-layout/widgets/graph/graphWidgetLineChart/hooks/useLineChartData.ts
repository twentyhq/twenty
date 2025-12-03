import { type LineChartEnrichedSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartEnrichedSeries';
import { type LineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeries';
import { type GraphColorRegistry } from '@/page-layout/widgets/graph/types/GraphColorRegistry';
import { createAreaFillDef } from '@/page-layout/widgets/graph/utils/createAreaFillDef';
import { getColorScheme } from '@/page-layout/widgets/graph/utils/getColorScheme';
import { type LineSeries } from '@nivo/line';

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
  const enrichedSeries: LineChartEnrichedSeries[] = [];
  const nivoData: LineSeries[] = [];
  const defs: ReturnType<typeof createAreaFillDef>[] = [];
  const fill: { match: { id: string }; id: string }[] = [];
  const colors: string[] = [];
  const legendItems: { id: string; label: string; color: string }[] = [];

  for (const [index, series] of data.entries()) {
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
    const label = series.label || series.id;

    enrichedSeries.push({ ...series, colorScheme, areaFillId, label });
    nivoData.push({
      id: series.id,
      data: series.data.map((point) => ({ x: point.x, y: point.y })),
    });
    defs.push(createAreaFillDef(colorScheme, areaFillId));
    fill.push({ match: { id: series.id }, id: areaFillId });
    colors.push(colorScheme.solid);
    legendItems.push({ id: series.id, label, color: colorScheme.solid });
  }

  return { enrichedSeries, nivoData, defs, fill, colors, legendItems };
};
