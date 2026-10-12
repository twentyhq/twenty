import { isNumber, isObject } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

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

  return Object.entries(nextSnapshot).every(([snapshotKey, nextValue]) => {
    const previousValue = previousSnapshot[snapshotKey];
    if (isNumber(nextValue) && isNumber(previousValue)) {
      return Math.abs(previousValue - nextValue) < GEOMETRY_EPSILON_PIXELS;
    }
    if (isObject(nextValue) && isObject(previousValue)) {
      return (
        Object.keys(previousValue).length === Object.keys(nextValue).length &&
        Object.entries(nextValue).every(
          ([name, value]) => previousValue[name] === value,
        )
      );
    }
    return previousValue === nextValue;
  });
};
