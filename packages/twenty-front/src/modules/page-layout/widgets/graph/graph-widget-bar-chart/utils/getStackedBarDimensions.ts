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

  const clampToAxis = (pixel: number) =>
    Math.max(0, Math.min(valueAxisLength, pixel));

  if (isVertical && isNegative) {
    const newStack = negativeStackPixel - valuePixelDelta;
    const clampedCurrent = clampToAxis(negativeStackPixel);
    const clampedNew = clampToAxis(newStack);

    return {
      x: categoryPosition,
      y: valueAxisLength - clampedCurrent,
      width: barThickness,
      height: clampedCurrent - clampedNew,
      newPositiveStackPixel: positiveStackPixel,
      newNegativeStackPixel: newStack,
    };
  }

  if (isVertical) {
    const newStack = positiveStackPixel + valuePixelDelta;
    const clampedCurrent = clampToAxis(positiveStackPixel);
    const clampedNew = clampToAxis(newStack);

    return {
      x: categoryPosition,
      y: valueAxisLength - clampedNew,
      width: barThickness,
      height: clampedNew - clampedCurrent,
      newPositiveStackPixel: newStack,
      newNegativeStackPixel: negativeStackPixel,
    };
  }

  if (isNegative) {
    const newStack = negativeStackPixel - valuePixelDelta;
    const clampedCurrent = clampToAxis(negativeStackPixel);
    const clampedNew = clampToAxis(newStack);

    return {
      x: clampedNew,
      y: categoryPosition,
      width: clampedCurrent - clampedNew,
      height: barThickness,
      newPositiveStackPixel: positiveStackPixel,
      newNegativeStackPixel: newStack,
    };
  }

  const newStack = positiveStackPixel + valuePixelDelta;
  const clampedCurrent = clampToAxis(positiveStackPixel);
  const clampedNew = clampToAxis(newStack);

  return {
    x: clampedCurrent,
    y: categoryPosition,
    width: clampedNew - clampedCurrent,
    height: barThickness,
    newPositiveStackPixel: newStack,
    newNegativeStackPixel: negativeStackPixel,
  };
};
