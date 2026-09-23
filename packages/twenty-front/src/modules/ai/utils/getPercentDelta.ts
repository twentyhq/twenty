import { isDefined } from 'twenty-shared/utils';

type GetPercentDeltaArgs = {
  value: number | null | undefined;
  reference: number | null | undefined;
};

export const getPercentDelta = ({
  value,
  reference,
}: GetPercentDeltaArgs): number | undefined => {
  if (!isDefined(value) || !isDefined(reference) || reference <= 0) {
    return undefined;
  }

  return Math.round(((value - reference) / reference) * 100);
};
