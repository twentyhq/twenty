import { isDefined } from 'twenty-shared/utils';

export const computeInsertPositionFromBounds = (
  previousPosition: number | undefined,
  nextPosition: number | undefined,
): number => {
  if (!isDefined(previousPosition) && isDefined(nextPosition)) {
    return nextPosition - 1;
  }

  if (isDefined(previousPosition) && !isDefined(nextPosition)) {
    return previousPosition + 1;
  }

  if (isDefined(previousPosition) && isDefined(nextPosition)) {
    if (previousPosition === nextPosition) {
      return previousPosition - 1;
    }

    return (previousPosition + nextPosition) / 2;
  }

  return 0;
};
