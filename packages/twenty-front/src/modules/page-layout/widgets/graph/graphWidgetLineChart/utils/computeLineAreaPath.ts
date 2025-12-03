import { area, curveMonotoneX, type CurveFactory } from 'd3-shape';

import { type ComputedSeries, type LineSeries } from '@nivo/line';

type ComputeLineAreaPathParams = {
  currentSeries: ComputedSeries<LineSeries>;
  prevSeries?: ComputedSeries<LineSeries> | null;
  baseline: number;
  curve?: CurveFactory;
};

export const computeLineAreaPath = ({
  currentSeries,
  prevSeries,
  baseline,
  curve = curveMonotoneX,
}: ComputeLineAreaPathParams) => {
  type PositionData = (typeof currentSeries.data)[number];

  const areaGenerator = area<PositionData>()
    .defined((d) => d.position.x !== null && d.position.y !== null)
    .x((d) => d.position.x ?? 0)
    .y1((d) => d.position.y ?? 0)
    .y0((_, index) => {
      if (prevSeries !== null && prevSeries !== undefined) {
        const prevPoint = prevSeries.data[index];
        if (prevPoint !== undefined && prevPoint.position.y !== null) {
          return prevPoint.position.y;
        }
      }
      return baseline;
    })
    .curve(curve);

  return areaGenerator(currentSeries.data);
};
