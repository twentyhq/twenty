const MAXIMUM_TICK_COUNT = 4;

export const getApplicationMonitoringChartIntegerTickValues = (
  maxValue: number,
): number[] => {
  const tickStep = Math.max(1, Math.ceil(maxValue / MAXIMUM_TICK_COUNT));
  const tickCount = Math.max(1, Math.ceil(maxValue / tickStep));

  return Array.from({ length: tickCount + 1 }, (_, index) => index * tickStep);
};
