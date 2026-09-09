import { themeCssVariables } from 'twenty-ui/theme-constants';
import { getModelComparisonPercentile } from '@/settings/ai/utils/getModelComparisonPercentile';

export const getModelComparisonColor = (
  value: number,
  comparisonValues: number[],
  lowerIsBetter = false,
): string => {
  const values = comparisonValues.filter(
    (comparisonValue) =>
      Number.isFinite(comparisonValue) && comparisonValue >= 0,
  );

  if (
    values.length < 2 ||
    !values.includes(value) ||
    values.every((entry) => entry === values[0])
  ) {
    return themeCssVariables.font.color.tertiary;
  }

  const percentile = getModelComparisonPercentile(value, values);
  const relativeQuality = lowerIsBetter ? 1 - percentile : percentile;

  const sortedValues = [...values].sort((first, second) => first - second);
  const middle = Math.floor(sortedValues.length / 2);
  const median =
    sortedValues.length % 2 === 0
      ? (sortedValues[middle - 1] + sortedValues[middle]) / 2
      : sortedValues[middle];

  // Ranking last alone should not imply poor performance in a strong catalog.
  const isExtremeOutlier =
    median > 0 &&
    relativeQuality <= 0.05 &&
    (lowerIsBetter ? value >= median * 5 : value <= median / 5);

  if (isExtremeOutlier) {
    return themeCssVariables.color.red9;
  }

  if (relativeQuality >= 0.8) {
    return themeCssVariables.color.green9;
  }

  if (relativeQuality >= 0.6) {
    return themeCssVariables.color.grass9;
  }

  if (relativeQuality >= 0.4) {
    return themeCssVariables.color.lime9;
  }

  if (relativeQuality >= 0.2) {
    return themeCssVariables.color.yellow9;
  }

  return themeCssVariables.color.orange9;
};
