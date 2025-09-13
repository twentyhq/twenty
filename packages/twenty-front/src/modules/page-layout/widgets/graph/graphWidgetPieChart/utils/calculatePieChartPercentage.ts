export const calculatePieChartPercentage = (
  value: number,
  totalValue: number,
): number => {
  return totalValue > 0 ? (value / totalValue) * 100 : 0;
};
