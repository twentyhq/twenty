import { type GraphLabelData } from '@/page-layout/widgets/graph/types/GraphLabelData';
import { type LineSeries, type Point } from '@nivo/line';
import { isDefined } from 'twenty-shared/utils';

export const computeLineChartStackedLabels = (
  points: readonly Point<LineSeries>[],
): GraphLabelData[] => {
  const stackData = new Map<
    string,
    {
      total: number;
      minimumYPosition: number;
      maximumYPosition: number;
      xPosition: number;
    }
  >();

  for (const point of points) {
    const groupKey = String(point.data.x);
    const existingGroup = stackData.get(groupKey);

    if (isDefined(existingGroup)) {
      existingGroup.total += Number(point.data.y);
      existingGroup.minimumYPosition = Math.min(
        existingGroup.minimumYPosition,
        point.y,
      );
      existingGroup.maximumYPosition = Math.max(
        existingGroup.maximumYPosition,
        point.y,
      );
    } else {
      stackData.set(groupKey, {
        total: Number(point.data.y),
        minimumYPosition: point.y,
        maximumYPosition: point.y,
        xPosition: point.x,
      });
    }
  }

  const groupedEntries = Array.from(stackData.entries());

  const labels: GraphLabelData[] = groupedEntries.map(
    ([groupKey, { total, minimumYPosition, maximumYPosition, xPosition }]) => {
      const isNegativeTotal = total < 0;
      const labelYPosition = isNegativeTotal
        ? maximumYPosition
        : minimumYPosition;

      return {
        key: `total-${groupKey}`,
        value: total,
        x: xPosition,
        y: labelYPosition,
        shouldRenderBelow: isNegativeTotal,
      };
    },
  );

  return labels;
};
