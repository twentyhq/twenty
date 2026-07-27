import { isNumber } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { GEOMETRY_EPSILON_PIXELS } from '@/host/constants/GeometryEpsilonPixels';

export const isGeometrySnapshotEqualWithinEpsilon = <
  TSnapshot extends Record<string, number | string | null>,
>(
  previousSnapshot: TSnapshot | null | undefined,
  nextSnapshot: TSnapshot,
): boolean => {
  if (!isDefined(previousSnapshot)) {
    return false;
  }

  return Object.entries(nextSnapshot).every(([snapshotKey, nextValue]) => {
    const previousValue = previousSnapshot[snapshotKey];

    if (isNumber(nextValue) && isNumber(previousValue)) {
      return Math.abs(previousValue - nextValue) < GEOMETRY_EPSILON_PIXELS;
    }

    return previousValue === nextValue;
  });
};
