export const calculatePieChartPercentage = (
  value: number,
  totalValue: number,
): number => {
  if (isNaN(value) || isNaN(totalValue)) {
    return NaN;
  }
  return totalValue > 0 ? (value / totalValue) * 100 : 0;
};
