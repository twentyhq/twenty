const MIN_TICK_SPACING_HEIGHT_RATIO = 2.5;

type ComputeBarChartValueTickCountProps = {
  height: number;
  axisFontSize: number;
};

export const computeBarChartValueTickCount = ({
  height,
  axisFontSize,
}: ComputeBarChartValueTickCountProps): number => {
  const minHeightPerTick = axisFontSize * MIN_TICK_SPACING_HEIGHT_RATIO;
  return Math.max(1, Math.floor(height / minHeightPerTick));
};
