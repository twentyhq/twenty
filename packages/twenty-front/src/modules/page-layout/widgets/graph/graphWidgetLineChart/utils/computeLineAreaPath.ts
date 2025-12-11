import { area, curveMonotoneX, type CurveFactory } from 'd3-shape';
import { isDefined } from 'twenty-shared/utils';

import { type ComputedSeries, type LineSeries } from '@nivo/line';

type ComputeLineAreaPathParams = {
  currentSeries: ComputedSeries<LineSeries>;
  previousStackedSeries?: ComputedSeries<LineSeries> | null;
  baseline: number;
  curve?: CurveFactory;
};

export const computeLineAreaPath = ({
  currentSeries,
  previousStackedSeries,
  baseline,
  curve = curveMonotoneX,
}: ComputeLineAreaPathParams) => {
  type PositionData = (typeof currentSeries.data)[number];

  const areaGenerator = area<PositionData>()
    .defined((d) => d.position.x !== null && d.position.y !== null)
    .x((d) => d.position.x ?? 0)
    .y1((d) => d.position.y ?? 0)
    .y0((_, index) => {
      if (isDefined(previousStackedSeries)) {
        const previousPoint = previousStackedSeries.data[index];
        if (isDefined(previousPoint) && isDefined(previousPoint.position.y)) {
          return previousPoint.position.y;
        }
      }
      return baseline;
    })
    .curve(curve);

  return areaGenerator(currentSeries.data);
};
