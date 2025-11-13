import { GraphDataLabel } from '@/page-layout/widgets/graph/components/GraphDataLabel';
import { type GraphLabelData } from '@/page-layout/widgets/graph/types/GraphLabelData';
import {
  type LineCustomSvgLayerProps,
  type LineSeries,
  type Point,
} from '@nivo/line';
import { isDefined } from 'twenty-shared/utils';

type CustomPointLabelsLayerProps = Pick<
  LineCustomSvgLayerProps<LineSeries>,
  'points' | 'yScale'
> & {
  formatValue?: (value: number) => string;
  offset?: number;
  groupMode?: 'stacked';
  omitNullValues?: boolean;
};

const computeGroupedLabels = (
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

const computeStackedLabels = (
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

export const CustomPointLabelsLayer = ({
  points,
  yScale,
  formatValue,
  offset = 0,
  groupMode,
  omitNullValues = false,
}: CustomPointLabelsLayerProps) => {
  const labels =
    groupMode === 'stacked'
      ? computeStackedLabels(points, yScale)
      : computeGroupedLabels(points);

  const labelsToRender = labels.filter((label) =>
    omitNullValues ? label.value !== 0 : true,
  );

  return (
    <>
      {labelsToRender.map((label) => (
        <GraphDataLabel
          key={label.key}
          label={label}
          formatValue={formatValue}
          offset={offset}
          isVerticalLayout={true}
        />
      ))}
    </>
  );
};
