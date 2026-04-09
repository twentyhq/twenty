export const formatNumberChartTrend = (trendPercentage: number): string => {
  return trendPercentage >= 0 ? `+${trendPercentage}` : `${trendPercentage}`;
};
