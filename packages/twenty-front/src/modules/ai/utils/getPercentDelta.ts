import { isDefined } from 'twenty-shared/utils';

export const getPercentDelta = (
  value: number | null | undefined,
  reference: number | null | undefined,
): number | undefined => {
  if (!isDefined(value) || !isDefined(reference) || reference <= 0) {
    return undefined;
  }

  return Math.round(((value - reference) / reference) * 100);
};
