import { LineAnimatedAreaPath } from '@/page-layout/widgets/graph/graphWidgetLineChart/components/LineAnimatedAreaPath';
import { type LineChartEnrichedSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartEnrichedSeries';
import { computeLineAreaPath } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/computeLineAreaPath';
import { createAreaFillDef } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/createAreaFillDef';
import {
  type ComputedSeries,
  type LineCustomSvgLayerProps,
  type LineSeries,
} from '@nivo/line';
import { isNumberOrNaN } from '@sniptt/guards';
import { useMemo } from 'react';

type CustomStackedAreasLayerProps = {
  series: readonly ComputedSeries<LineSeries>[];
  innerHeight: number;
  enrichedSeries: LineChartEnrichedSeries[];
  enableArea: boolean;
  yScale: LineCustomSvgLayerProps<LineSeries>['yScale'];
  isStacked: boolean;
};

export const CustomStackedAreasLayer = ({
  series,
  innerHeight,
  enrichedSeries,
  enableArea,
  yScale,
  isStacked,
}: CustomStackedAreasLayerProps) => {
  const seriesById = useMemo(
    () =>
      new Map(
        enrichedSeries.map((seriesItem) => [String(seriesItem.id), seriesItem]),
      ),
    [enrichedSeries],
  );

  const baseline = useMemo(() => {
    const scaled = yScale(0);
    if (!isNumberOrNaN(scaled)) {
      return innerHeight;
    }
    if (scaled < 0) return 0;
    if (scaled > innerHeight) return innerHeight;
    return scaled;
  }, [innerHeight, yScale]);

  const paths = useMemo(() => {
    if (!enableArea) {
      return [];
    }

    return series.reduce(
      (acc, currentSeries, index) => {
        const prevSeries =
          isStacked && index > 0
            ? (series[index - 1] as typeof currentSeries)
            : null;
        const enriched = seriesById.get(String(currentSeries.id));
        if (!enriched) {
          return acc;
        }

        const path = computeLineAreaPath({
          currentSeries,
          prevSeries,
          baseline,
        });

        if (path !== null) {
          acc.push({
            id: String(currentSeries.id),
            path,
            fillId: enriched.areaFillId,
          });
        }

        return acc;
      },
      [] as { id: string; path: string; fillId: string }[],
    );
  }, [enableArea, series, seriesById, baseline, isStacked]);

  if (!enableArea) {
    return null;
  }

  return (
    <g>
      <defs>
        {enrichedSeries.map((seriesItem) => {
          const def = createAreaFillDef(
            seriesItem.colorScheme,
            seriesItem.areaFillId,
          );
          return (
            <linearGradient
              key={def.id}
              id={def.id}
              x1={def.x1}
              y1={def.y1}
              x2={def.x2}
              y2={def.y2}
            >
              {def.colors.map((color, idx) => (
                <stop
                  key={idx}
                  offset={`${color.offset}%`}
                  stopColor={color.color}
                  stopOpacity={color.opacity}
                />
              ))}
            </linearGradient>
          );
        })}
      </defs>
      {paths.map(({ id, path, fillId }) => (
        <LineAnimatedAreaPath key={id} path={path} fillId={fillId} />
      ))}
    </g>
  );
};
