import { computeMidpointPosition, isDefined } from 'twenty-shared/utils';

export const getPositionBetween = (
  prevPosition: number | null | undefined,
  nextPosition: number | null | undefined,
): number => {
  if (!isDefined(prevPosition) && isDefined(nextPosition))
    return nextPosition - 1;
  if (isDefined(prevPosition) && !isDefined(nextPosition))
    return prevPosition + 1;
  if (isDefined(prevPosition) && isDefined(nextPosition)) {
    if (prevPosition === nextPosition) {
      return prevPosition - 1;
    }
    return computeMidpointPosition({
      firstPosition: prevPosition,
      secondPosition: nextPosition,
    });
  }
  return 0;
};
