import { type BarPosition } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeBarPositions';
import { isDefined } from 'twenty-shared/utils';

export type CanvasBarSlice = {
  indexValue: string;
  bars: BarPosition[];
  sliceLeft: number;
  sliceRight: number;
  sliceCenter: number;
};

type ComputeSlicesFromCanvasBarsParams = {
  bars: BarPosition[];
  isVerticalLayout: boolean;
};

export const computeSlicesFromCanvasBars = ({
  bars,
  isVerticalLayout,
}: ComputeSlicesFromCanvasBarsParams): CanvasBarSlice[] => {
  if (bars.length === 0) {
    return [];
  }

  const groupedBarsByIndex = new Map<string, BarPosition[]>();

  for (const bar of bars) {
    const indexKey = bar.indexValue;
    const existingBars = groupedBarsByIndex.get(indexKey);
    if (isDefined(existingBars)) {
      existingBars.push(bar);
    } else {
      groupedBarsByIndex.set(indexKey, [bar]);
    }
  }

  const computedSlices: CanvasBarSlice[] = [];

  for (const [indexValue, barsInGroup] of groupedBarsByIndex) {
    const minPosition = Math.min(
      ...barsInGroup.map((bar) => (isVerticalLayout ? bar.x : bar.y)),
    );
    const maxPosition = Math.max(
      ...barsInGroup.map((bar) =>
        isVerticalLayout ? bar.x + bar.width : bar.y + bar.height,
      ),
    );

    computedSlices.push({
      indexValue,
      bars: [...barsInGroup],
      sliceLeft: minPosition,
      sliceRight: maxPosition,
      sliceCenter: (minPosition + maxPosition) / 2,
    });
  }

  computedSlices.sort((sliceA, sliceB) => sliceA.sliceLeft - sliceB.sliceLeft);

  return computedSlices;
};

type FindSliceAtCanvasPositionParams = {
  mouseX: number;
  mouseY: number;
  slices: CanvasBarSlice[];
  isVerticalLayout: boolean;
};

export const findSliceAtCanvasPosition = ({
  mouseX,
  mouseY,
  slices,
  isVerticalLayout,
}: FindSliceAtCanvasPositionParams): CanvasBarSlice | null => {
  if (slices.length === 0) {
    return null;
  }

  const positionAlongAxis = isVerticalLayout ? mouseX : mouseY;

  const nearestSlice = slices.reduce((nearest, slice) => {
    const currentDistance = Math.abs(slice.sliceCenter - positionAlongAxis);
    const nearestDistance = Math.abs(nearest.sliceCenter - positionAlongAxis);
    return currentDistance < nearestDistance ? slice : nearest;
  });

  return nearestSlice;
};

type FindAnchorBarInCanvasSliceParams = {
  bars: BarPosition[];
  isVerticalLayout: boolean;
};

export const findAnchorBarInCanvasSlice = ({
  bars,
  isVerticalLayout,
}: FindAnchorBarInCanvasSliceParams): BarPosition => {
  if (bars.length === 0) {
    throw new Error('Cannot find anchor bar in empty slice');
  }

  return bars.reduce((anchor, bar) => {
    if (isVerticalLayout) {
      return bar.y < anchor.y ? bar : anchor;
    }
    return bar.x + bar.width > anchor.x + anchor.width ? bar : anchor;
  });
};
