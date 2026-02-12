import { LineAnimatedAreaPath } from '@/page-layout/widgets/graph/graphWidgetLineChart/components/LineAnimatedAreaPath';
import { LineAreaGradientDefs } from '@/page-layout/widgets/graph/graphWidgetLineChart/components/LineAreaGradientDefs';
import { type LineChartEnrichedSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartEnrichedSeries';
import { computeLineAreaPath } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/computeLineAreaPath';
import {
  type ComputedSeries,
  type LineCustomSvgLayerProps,
  type LineSeries,
} from '@nivo/line';
import { isNumberOrNaN } from '@sniptt/guards';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

type CustomStackedAreasLayerProps = {
  series: readonly ComputedSeries<LineSeries>[];
  innerHeight: number;
  enrichedSeries: LineChartEnrichedSeries[];
  enableArea: boolean;
  yScale: LineCustomSvgLayerProps<LineSeries>['yScale'];
  isStacked: boolean;
};

type AreaPathData = {
  id: string;
  path: string;
  fillId: string;
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
    return Math.max(0, Math.min(scaled, innerHeight));
  }, [innerHeight, yScale]);

  const paths = useMemo(() => {
    if (!enableArea) {
      return [];
    }

    const initialAreaPathData: AreaPathData[] = [];

    return series.reduce((acc, currentSeries, index) => {
      const previousStackedSeries =
        isStacked && index > 0 ? series[index - 1] : null;

      const enriched = seriesById.get(String(currentSeries.id));
      if (!isDefined(enriched)) {
        return acc;
      }

      const path = computeLineAreaPath({
        currentSeries,
        previousStackedSeries,
        baseline,
      });

      if (isDefined(path)) {
        acc.push({
          id: String(currentSeries.id),
          path,
          fillId: enriched.areaFillId,
        });
      }

      return acc;
    }, initialAreaPathData);
  }, [enableArea, series, seriesById, baseline, isStacked]);

  if (!enableArea) {
    return null;
  }

  return (
    <g>
      <LineAreaGradientDefs enrichedSeries={enrichedSeries} />
      {paths.map(({ id, path, fillId }) => (
        <LineAnimatedAreaPath key={id} id={id} path={path} fillId={fillId} />
      ))}
    </g>
  );
};
