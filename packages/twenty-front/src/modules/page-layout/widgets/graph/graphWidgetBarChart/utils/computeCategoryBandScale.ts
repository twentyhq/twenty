import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';

type CategoryBandScale = {
  step: number;
  bandwidth: number;
  offset: number;
};

export const computeCategoryBandScale = ({
  axisLength,
  count,
  padding = BAR_CHART_CONSTANTS.OUTER_PADDING_RATIO,
  outerPaddingPx = BAR_CHART_CONSTANTS.OUTER_PADDING_PX,
}: {
  axisLength: number;
  count: number;
  padding?: number;
  outerPaddingPx?: number;
}): CategoryBandScale => {
  if (axisLength <= 0 || count <= 0) {
    return { step: 0, bandwidth: 0, offset: 0 };
  }

  const safeOuterPaddingPx = Math.max(0, outerPaddingPx);
  const effectiveAxisLength = Math.max(0, axisLength - safeOuterPaddingPx * 2);

  const clampedPadding = Math.max(0, Math.min(1, padding));
  const stepDenominator = Math.max(1, count - clampedPadding + clampedPadding * 2);
  const step = effectiveAxisLength / stepDenominator;
  const bandwidth = step * (1 - clampedPadding);
  const offset = safeOuterPaddingPx + step * clampedPadding;

  return { step, bandwidth, offset };
};
