import { type ChartValueRange } from '@/page-layout/widgets/graph/types/ChartValueRange';

export const calculateValueRangeFromValues = (
  values: number[],
): ChartValueRange => {
  let minimumValue = 0;
  let maximumValue = 0;

  for (const value of values) {
    if (isNaN(value)) {
      continue;
    }

    minimumValue = Math.min(minimumValue, value);
    maximumValue = Math.max(maximumValue, value);
  }

  minimumValue = Math.min(minimumValue, 0);
  maximumValue = Math.max(maximumValue, 0);

  return { minimum: minimumValue, maximum: maximumValue };
};
