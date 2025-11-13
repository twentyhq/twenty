import { type GraphLabelData } from '@/page-layout/widgets/graph/types/GraphLabelData';
import { type LineSeries, type Point } from '@nivo/line';
import { isDefined } from 'twenty-shared/utils';

export const computeLineChartStackedLabels = (
  points: readonly Point<LineSeries>[],
  yScale: (value: number) => number,
): GraphLabelData[] => {
  const groupTotals = new Map<
    string,
    {
      total: number;
      minimumYPosition: number;
      xPosition: number;
    }
  >();

  for (const point of points) {
    const groupKey = String(point.data.x);
    const existingGroup = groupTotals.get(groupKey);

    if (isDefined(existingGroup)) {
      existingGroup.total += Number(point.data.y);
      existingGroup.minimumYPosition = Math.min(
        existingGroup.minimumYPosition,
        point.y,
      );
    } else {
      groupTotals.set(groupKey, {
        total: Number(point.data.y),
        minimumYPosition: point.y,
        xPosition: point.x,
      });
    }
  }

  const zeroAxisYPosition = yScale(0);

  return Array.from(groupTotals.entries()).map(
    ([groupKey, { total, minimumYPosition, xPosition }]) => {
      const isNegativeTotal = total < 0;
      const labelYPosition = isNegativeTotal
        ? zeroAxisYPosition
        : minimumYPosition;

      return {
        key: `total-${groupKey}`,
        value: total,
        x: xPosition,
        y: labelYPosition,
        shouldRenderBelow: false,
      };
    },
  );
};
