import { isNumber } from '@sniptt/guards';
import { fastDeepEqual, isDefined } from 'twenty-shared/utils';

import { GEOMETRY_EPSILON_PIXELS } from '@/host/geometry/constants/GeometryEpsilonPixels';

type SnapshotValue =
  | number
  | string
  | null
  | undefined
  | Record<string, string>;

export const isGeometrySnapshotEqualWithinEpsilon = <
  TSnapshot extends Record<string, SnapshotValue>,
>({
  previousSnapshot,
  nextSnapshot,
}: {
  previousSnapshot: TSnapshot | null | undefined;
  nextSnapshot: TSnapshot;
}): boolean => {
  if (!isDefined(previousSnapshot)) {
    return false;
  }

  return Object.keys(nextSnapshot).every((snapshotKey) => {
    const previousValue = previousSnapshot[snapshotKey];
    const nextValue = nextSnapshot[snapshotKey];

    return isNumber(previousValue) && isNumber(nextValue)
      ? Math.abs(previousValue - nextValue) < GEOMETRY_EPSILON_PIXELS
      : fastDeepEqual(previousValue, nextValue);
  });
};
