import { GEOMETRY_EPSILON_PIXELS } from '@/host/constants/GeometryEpsilonPixels';

export const areSnapshotKeysEqualWithinEpsilon = <TKey extends string>(
  previousSnapshot: Record<TKey, number>,
  nextSnapshot: Record<TKey, number>,
  keys: readonly TKey[],
): boolean =>
  keys.every(
    (key) =>
      Math.abs(previousSnapshot[key] - nextSnapshot[key]) <
      GEOMETRY_EPSILON_PIXELS,
  );
