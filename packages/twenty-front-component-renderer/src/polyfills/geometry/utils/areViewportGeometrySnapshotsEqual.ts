import { isDefined } from 'twenty-shared/utils';

import { type ViewportGeometrySnapshot } from '@/types/ViewportGeometrySnapshot';

export const areViewportGeometrySnapshotsEqual = (
  previousSnapshot: ViewportGeometrySnapshot | null,
  nextSnapshot: ViewportGeometrySnapshot,
): boolean => {
  if (!isDefined(previousSnapshot)) {
    return false;
  }

  return Object.entries(nextSnapshot).every(
    ([snapshotKey, nextValue]) =>
      previousSnapshot[snapshotKey as keyof ViewportGeometrySnapshot] ===
      nextValue,
  );
};
