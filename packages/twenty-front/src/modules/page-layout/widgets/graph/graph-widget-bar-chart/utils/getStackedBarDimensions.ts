import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graph-widget-bar-chart/constants/BarChartConstants';
import { computeValueScale } from '@/page-layout/widgets/graph/chart-core/utils/computeValueScale';
import { type BarPositionContext } from '@/page-layout/widgets/graph/graph-widget-bar-chart/utils/computeBarPositionContext';

type GetStackedBarDimensionsParams = {
  ctx: BarPositionContext;
  layout: StackedBarLayout;
  categoryStart: number;
  value: number;
  positiveStackPixel: number;
  negativeStackPixel: number;
};

type StackedBarDimensionsResult = {
  x: number;
  y: number;
  width: number;
  height: number;
  newPositiveStackPixel: number;
  newNegativeStackPixel: number;
};

export type StackedBarLayout = {
  barThickness: number;
  categoryBarCenteringOffset: number;
  stackValueToPixel: (value: number) => number;
  stackRange: number;
};

export const computeStackedBarLayout = (
  ctx: BarPositionContext,
  valueDomain: { min: number; max: number },
): StackedBarLayout => {
  const { categoryWidth, valueAxisLength } = ctx;

  const barThickness = Math.min(
    categoryWidth,
    BAR_CHART_CONSTANTS.MAXIMUM_WIDTH,
  );
  const categoryBarCenteringOffset = (categoryWidth - barThickness) / 2;

  const { valueToPixel: stackValueToPixel, range: stackRange } =
    computeValueScale({
      domain: { min: 0, max: valueDomain.max - valueDomain.min },
      axisLength: valueAxisLength,
    });

  return {
    barThickness,
    categoryBarCenteringOffset,
    stackValueToPixel,
    stackRange,
  };
};

export const getStackedBarDimensions = ({
  ctx,
  layout,
  categoryStart,
  value,
  positiveStackPixel,
  negativeStackPixel,
}: GetStackedBarDimensionsParams): StackedBarDimensionsResult => {
  const { isVertical, valueAxisLength } = ctx;
  const {
    barThickness,
    categoryBarCenteringOffset,
    stackValueToPixel,
    stackRange,
  } = layout;
  const categoryPosition = categoryStart + categoryBarCenteringOffset;

  const isNegative = value < 0;
  const valuePixelDelta =
    stackRange === 0 ? 0 : stackValueToPixel(Math.abs(value));

  if (isVertical && isNegative) {
    const currentStack = negativeStackPixel;
    const newStack = negativeStackPixel - valuePixelDelta;

    const clampedCurrentStack = Math.max(
      0,
      Math.min(valueAxisLength, currentStack),
    );
    const clampedNewStack = Math.max(0, Math.min(valueAxisLength, newStack));

    const height = clampedCurrentStack - clampedNewStack;

    return {
      x: categoryPosition,
      y: valueAxisLength - clampedCurrentStack,
      width: barThickness,
      height,
      newPositiveStackPixel: positiveStackPixel,
      newNegativeStackPixel: newStack,
    };
  }

  if (isVertical) {
    const currentStack = positiveStackPixel;
    const newStack = positiveStackPixel + valuePixelDelta;

    const clampedCurrentStack = Math.max(
      0,
      Math.min(valueAxisLength, currentStack),
    );
    const clampedNewStack = Math.max(0, Math.min(valueAxisLength, newStack));

    const height = clampedNewStack - clampedCurrentStack;

    return {
      x: categoryPosition,
      y: valueAxisLength - clampedNewStack,
      width: barThickness,
      height,
      newPositiveStackPixel: newStack,
      newNegativeStackPixel: negativeStackPixel,
    };
  }

  if (isNegative) {
    const currentStack = negativeStackPixel;
    const newStack = negativeStackPixel - valuePixelDelta;

    const clampedCurrentStack = Math.max(
      0,
      Math.min(valueAxisLength, currentStack),
    );
    const clampedNewStack = Math.max(0, Math.min(valueAxisLength, newStack));

    const width = clampedCurrentStack - clampedNewStack;

    return {
      x: clampedNewStack,
      y: categoryPosition,
      width,
      height: barThickness,
      newPositiveStackPixel: positiveStackPixel,
      newNegativeStackPixel: newStack,
    };
  }

  const currentStack = positiveStackPixel;
  const newStack = positiveStackPixel + valuePixelDelta;

  const clampedCurrentStack = Math.max(
    0,
    Math.min(valueAxisLength, currentStack),
  );
  const clampedNewStack = Math.max(0, Math.min(valueAxisLength, newStack));

  const width = clampedNewStack - clampedCurrentStack;

  return {
    x: clampedCurrentStack,
    y: categoryPosition,
    width,
    height: barThickness,
    newPositiveStackPixel: newStack,
    newNegativeStackPixel: negativeStackPixel,
  };
};
