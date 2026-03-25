import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graph-widget-bar-chart/constants/BarChartConstants';
import { type BarPositionContext } from '@/page-layout/widgets/graph/graph-widget-bar-chart/utils/computeBarPositionContext';

type GetGroupedBarDimensionsParams = {
  ctx: BarPositionContext;
  layout: GroupedBarLayout;
  categoryStart: number;
  keyIndex: number;
  value: number;
};

export type GroupedBarLayout = {
  barThickness: number;
  groupCenteringOffset: number;
  barStride: number;
};

export const computeGroupedBarLayout = (
  ctx: BarPositionContext,
  innerPadding: number,
): GroupedBarLayout => {
  const { keysLength, categoryWidth } = ctx;

  const totalInnerPadding = innerPadding * (keysLength - 1);
  const availableBarSpace = categoryWidth - totalInnerPadding;
  const barThickness = Math.min(
    Math.max(
      availableBarSpace / keysLength,
      BAR_CHART_CONSTANTS.MINIMUM_BAR_WIDTH,
    ),
    BAR_CHART_CONSTANTS.MAXIMUM_WIDTH,
  );
  const actualTotalBarWidth = barThickness * keysLength + totalInnerPadding;
  const groupCenteringOffset = (categoryWidth - actualTotalBarWidth) / 2;
  const barStride = barThickness + innerPadding;

  return { barThickness, groupCenteringOffset, barStride };
};

export const getGroupedBarDimensions = ({
  ctx,
  layout,
  categoryStart,
  keyIndex,
  value,
}: GetGroupedBarDimensionsParams): {
  x: number;
  y: number;
  width: number;
  height: number;
} => {
  const { isVertical, valueAxisLength, valueToPixel, zeroPixel } = ctx;
  const { barThickness, groupCenteringOffset, barStride } = layout;

  const valuePixel = Math.max(
    0,
    Math.min(valueAxisLength, valueToPixel(value)),
  );
  const clampedZeroPixel = Math.max(0, Math.min(valueAxisLength, zeroPixel));
  const barStart = Math.min(clampedZeroPixel, valuePixel);
  const barLength = Math.abs(valuePixel - clampedZeroPixel);

  const categoryPosition =
    categoryStart + groupCenteringOffset + keyIndex * barStride;

  if (isVertical) {
    return {
      x: categoryPosition,
      y: valueAxisLength - barStart - barLength,
      width: barThickness,
      height: barLength,
    };
  }

  return {
    x: barStart,
    y: categoryPosition,
    width: barLength,
    height: barThickness,
  };
};
