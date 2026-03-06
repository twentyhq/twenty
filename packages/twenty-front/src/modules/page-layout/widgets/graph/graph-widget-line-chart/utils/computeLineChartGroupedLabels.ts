import { type GraphLabelData } from '@/page-layout/widgets/graph/types/GraphLabelData';
import { type LineSeries, type Point } from '@nivo/line';

export const computeLineChartGroupedLabels = (
  points: readonly Point<LineSeries>[],
): GraphLabelData[] => {
  return points.map((point) => {
    const value = Number(point.data.y);
    const shouldRenderBelow = value < 0;

    return {
      key: `value-${point.seriesId}-${point.data.x}`,
      value,
      x: point.x,
      y: point.y,
      shouldRenderBelow,
    };
  });
};
