import { isDefined } from 'twenty-shared/utils';

type UsageLimitProgress = {
  remainingValue: number;
  consumedPercentage: number;
  remainingPercentage: number;
};

export const computeUsageLimitProgress = ({
  limitValue,
  consumedValue,
}: {
  limitValue: number;
  consumedValue: number | null;
}): UsageLimitProgress | null => {
  if (!isDefined(consumedValue) || limitValue < 0) {
    return null;
  }

  if (limitValue === 0) {
    return {
      remainingValue: 0,
      consumedPercentage: 100,
      remainingPercentage: 0,
    };
  }

  const consumedPercentage = Math.min(
    100,
    Math.max(0, Math.round((consumedValue / limitValue) * 100)),
  );

  return {
    remainingValue: Math.max(0, limitValue - consumedValue),
    consumedPercentage,
    remainingPercentage: 100 - consumedPercentage,
  };
};
