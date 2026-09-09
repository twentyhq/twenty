import { t } from '@lingui/core/macro';
import { getModelComparisonPercentile } from '@/settings/ai/utils/getModelComparisonPercentile';

export const getCostCategory = (
  cost: number,
  comparisonCosts: number[],
): string => {
  if (comparisonCosts.length < 2) {
    return t`Medium`;
  }

  const percentile = getModelComparisonPercentile(cost, comparisonCosts) * 100;

  if (percentile < 20) {
    return t`Very low`;
  }

  if (percentile < 40) {
    return t`Low`;
  }

  if (percentile < 60) {
    return t`Medium`;
  }

  if (percentile < 80) {
    return t`High`;
  }

  return t`Very high`;
};
