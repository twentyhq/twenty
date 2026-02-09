import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { computeValueScale } from '@/page-layout/widgets/graph/chart-core/utils/computeValueScale';
import { type BarPositionContext } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeBarPositionContext';

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
    return {
      x: categoryPosition,
      y: valueAxisLength - negativeStackPixel,
      width: barThickness,
      height: valuePixelDelta,
      newPositiveStackPixel: positiveStackPixel,
      newNegativeStackPixel: negativeStackPixel - valuePixelDelta,
    };
  }

  if (isVertical) {
    return {
      x: categoryPosition,
      y: valueAxisLength - (positiveStackPixel + valuePixelDelta),
      width: barThickness,
      height: valuePixelDelta,
      newPositiveStackPixel: positiveStackPixel + valuePixelDelta,
      newNegativeStackPixel: negativeStackPixel,
    };
  }

  if (isNegative) {
    return {
      x: negativeStackPixel - valuePixelDelta,
      y: categoryPosition,
      width: valuePixelDelta,
      height: barThickness,
      newPositiveStackPixel: positiveStackPixel,
      newNegativeStackPixel: negativeStackPixel - valuePixelDelta,
    };
  }

  return {
    x: positiveStackPixel,
    y: categoryPosition,
    width: valuePixelDelta,
    height: barThickness,
    newPositiveStackPixel: positiveStackPixel + valuePixelDelta,
    newNegativeStackPixel: negativeStackPixel,
  };
};
