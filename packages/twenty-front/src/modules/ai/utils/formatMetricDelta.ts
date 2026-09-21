import { formatPercentDelta } from '@/ai/utils/formatPercentDelta';

export const formatMetricDelta = (deltaPercent: number): string => {
  if (deltaPercent < 100) {
    return formatPercentDelta(deltaPercent);
  }

  const multiplier = 1 + deltaPercent / 100;

  return `${Math.round(multiplier * 10) / 10}×`;
};
