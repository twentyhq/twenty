import { type BarChartLabelData } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartLabelData';
import { type BarPosition } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarPosition';
import { isDefined } from 'twenty-shared/utils';

export const computeBarChartStackedLabels = (
  bars: BarPosition[],
): BarChartLabelData[] => {
  const stackData = new Map<
    string,
    {
      total: number;
      minimumYPosition: number;
      maximumBottomYPosition: number;
      minimumXPosition: number;
      maximumXPosition: number;
      bars: BarPosition[];
    }
  >();

  for (const bar of bars) {
    const groupKey = bar.indexValue;
    const value = bar.value;
    const barTopY = bar.y;
    const barBottomY = bar.y + bar.height;
    const barLeftX = bar.x;
    const barRightX = bar.x + bar.width;
    const existingGroup = stackData.get(groupKey);

    if (isDefined(existingGroup)) {
      existingGroup.total += value;
      existingGroup.minimumYPosition = Math.min(
        existingGroup.minimumYPosition,
        barTopY,
      );
      existingGroup.maximumBottomYPosition = Math.max(
        existingGroup.maximumBottomYPosition,
        barBottomY,
      );
      existingGroup.minimumXPosition = Math.min(
        existingGroup.minimumXPosition,
        barLeftX,
      );
      existingGroup.maximumXPosition = Math.max(
        existingGroup.maximumXPosition,
        barRightX,
      );
      existingGroup.bars.push(bar);
    } else {
      stackData.set(groupKey, {
        total: value,
        minimumYPosition: barTopY,
        maximumBottomYPosition: barBottomY,
        minimumXPosition: barLeftX,
        maximumXPosition: barRightX,
        bars: [bar],
      });
    }
  }

  const groupedEntries = Array.from(stackData.entries());

  const labels: BarChartLabelData[] = groupedEntries.map(
    ([
      groupKey,
      {
        total,
        minimumYPosition,
        maximumBottomYPosition,
        minimumXPosition,
        maximumXPosition,
        bars: groupBars,
      },
    ]) => {
      const isNegativeTotal = total < 0;
      const centerX =
        groupBars.reduce((acc, bar) => acc + bar.x + bar.width / 2, 0) /
        groupBars.length;
      const centerY =
        groupBars.reduce((acc, bar) => acc + bar.y + bar.height / 2, 0) /
        groupBars.length;

      return {
        key: `total-${groupKey}`,
        value: total,
        verticalX: centerX,
        verticalY: isNegativeTotal ? maximumBottomYPosition : minimumYPosition,
        horizontalX: isNegativeTotal ? minimumXPosition : maximumXPosition,
        horizontalY: centerY,
        shouldRenderBelow: isNegativeTotal,
      };
    },
  );

  return labels;
};
