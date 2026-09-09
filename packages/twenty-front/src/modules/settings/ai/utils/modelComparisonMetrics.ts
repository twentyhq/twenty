import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { formatNumber } from '~/utils/format/formatNumber';
import { getModelComparisonPercentile } from '@/settings/ai/utils/getModelComparisonPercentile';

export const isDisplayableNumber = (
  value: number | null | undefined,
): value is number => isDefined(value) && Number.isFinite(value) && value >= 0;

export const formatCompactNumber = (value: number, decimals: number): string =>
  formatNumber(value, { abbreviate: true, decimals }).replace(/k$/, 'K');

export const formatDollarPrice = (dollars: number): string => {
  if (dollars === 0) {
    return '$0';
  }

  if (Math.abs(dollars) < 0.01) {
    return `$${dollars.toFixed(4)}`;
  }

  return `$${formatNumber(dollars, { decimals: 2 })}`;
};

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

export const withModelRanking = ({
  description,
  value,
  comparisonValues,
  lowerIsBetter = false,
}: {
  description: string;
  value: number;
  comparisonValues: number[];
  lowerIsBetter?: boolean;
}): string => {
  if (comparisonValues.length < 2) {
    return description;
  }

  const rank =
    comparisonValues.filter((comparisonValue) =>
      lowerIsBetter ? comparisonValue < value : comparisonValue > value,
    ).length + 1;
  const total = comparisonValues.length;
  const ranking = `#${rank}/${total}`;

  return `${ranking} · ${description}`;
};
