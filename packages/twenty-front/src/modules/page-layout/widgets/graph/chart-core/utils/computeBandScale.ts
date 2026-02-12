import { CHART_CORE_CONSTANTS } from '@/page-layout/widgets/graph/chart-core/constants/ChartCoreConstants';

type BandScale = {
  step: number;
  bandwidth: number;
  offset: number;
};

export const computeBandScale = ({
  axisLength,
  count,
  padding = CHART_CORE_CONSTANTS.DEFAULT_BAND_PADDING,
  outerPaddingPx = CHART_CORE_CONSTANTS.DEFAULT_OUTER_PADDING_PX,
}: {
  axisLength: number;
  count: number;
  padding?: number;
  outerPaddingPx?: number;
}): BandScale => {
  if (axisLength <= 0 || count <= 0) {
    return { step: 0, bandwidth: 0, offset: 0 };
  }

  const safeOuterPaddingPx = Math.max(0, outerPaddingPx);
  const effectiveAxisLength = Math.max(0, axisLength - safeOuterPaddingPx * 2);

  const clampedPadding = Math.max(0, Math.min(1, padding));
  const stepDenominator = Math.max(
    1,
    count - clampedPadding + clampedPadding * 2,
  );
  const step = effectiveAxisLength / stepDenominator;
  const bandwidth = step * (1 - clampedPadding);
  const offset = safeOuterPaddingPx + step * clampedPadding;

  return { step, bandwidth, offset };
};
