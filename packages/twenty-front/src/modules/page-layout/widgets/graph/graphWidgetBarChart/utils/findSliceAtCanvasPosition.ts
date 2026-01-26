import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { type BarPosition } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeBarPositions';
import { type ChartMargins } from '@/page-layout/widgets/graph/types/ChartMargins';
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

type ComputeAllCategorySlicesParams = {
  data: Record<string, unknown>[];
  indexBy: string;
  bars: BarPosition[];
  isVerticalLayout: boolean;
  chartWidth: number;
  chartHeight: number;
  margins: ChartMargins;
};

export const computeAllCategorySlices = ({
  data,
  indexBy,
  bars,
  isVerticalLayout,
  chartWidth,
  chartHeight,
  margins,
}: ComputeAllCategorySlicesParams): CanvasBarSlice[] => {
  if (data.length === 0) {
    return [];
  }

  const innerWidth = chartWidth - margins.left - margins.right;
  const innerHeight = chartHeight - margins.top - margins.bottom;
  const categoryAxisLength = isVerticalLayout ? innerWidth : innerHeight;
  const dataLength = data.length;

  const categoryWidth =
    (categoryAxisLength / dataLength) *
    (1 - BAR_CHART_CONSTANTS.OUTER_PADDING_RATIO);
  const outerPadding =
    (categoryAxisLength * BAR_CHART_CONSTANTS.OUTER_PADDING_RATIO) / 2;
  const categoryStep = categoryAxisLength / dataLength;

  const barsByIndexValue = new Map<string, BarPosition[]>();
  for (const bar of bars) {
    const existingBars = barsByIndexValue.get(bar.indexValue);
    if (isDefined(existingBars)) {
      existingBars.push(bar);
    } else {
      barsByIndexValue.set(bar.indexValue, [bar]);
    }
  }

  const slices: CanvasBarSlice[] = [];

  for (let dataIndex = 0; dataIndex < dataLength; dataIndex++) {
    const dataPoint = data[dataIndex];
    const indexValue = String(dataPoint[indexBy]);

    const effectiveIndex = isVerticalLayout
      ? dataIndex
      : dataLength - 1 - dataIndex;
    const categoryStart = outerPadding + effectiveIndex * categoryStep;
    const sliceLeft = categoryStart;
    const sliceRight = categoryStart + categoryWidth;
    const sliceCenter = (sliceLeft + sliceRight) / 2;

    const barsForCategory = barsByIndexValue.get(indexValue) ?? [];

    slices.push({
      indexValue,
      bars: barsForCategory,
      sliceLeft,
      sliceRight,
      sliceCenter,
    });
  }

  return slices;
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
