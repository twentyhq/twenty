export const getAxisBottomConfig = (xAxisLabel?: string) => ({
  tickSize: 0,
  tickPadding: 5,
  tickRotation: 0,
  legend: xAxisLabel,
  legendPosition: 'middle' as const,
  legendOffset: 40,
});
