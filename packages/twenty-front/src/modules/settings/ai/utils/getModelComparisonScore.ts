import { getModelComparisonPercentile } from '@/settings/ai/utils/getModelComparisonPercentile';

export const getModelComparisonScore = ({
  value,
  comparisonValues,
  lowerIsBetter = false,
}: {
  value: number;
  comparisonValues: number[];
  lowerIsBetter?: boolean;
}): number => {
  if (comparisonValues.length < 2) {
    return 50;
  }

  const percentile = getModelComparisonPercentile(value, comparisonValues);

  return Math.max((lowerIsBetter ? 1 - percentile : percentile) * 100, 8);
};
