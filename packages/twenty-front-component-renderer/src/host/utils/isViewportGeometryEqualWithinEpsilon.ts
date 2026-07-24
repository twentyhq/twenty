import { isDefined } from 'twenty-shared/utils';

import { areSnapshotKeysEqualWithinEpsilon } from '@/host/utils/areSnapshotKeysEqualWithinEpsilon';
import { type ViewportGeometrySnapshot } from '@/types/ViewportGeometrySnapshot';

const VIEWPORT_GEOMETRY_PIXEL_KEYS = [
  'innerWidth',
  'innerHeight',
  'scrollX',
  'scrollY',
  'rootContainerX',
  'rootContainerY',
  'rootContainerWidth',
  'rootContainerHeight',
  'rootContainerClientWidth',
  'rootContainerClientHeight',
] satisfies (keyof ViewportGeometrySnapshot)[];

export const isViewportGeometryEqualWithinEpsilon = (
  previousSnapshot: ViewportGeometrySnapshot | null,
  nextSnapshot: ViewportGeometrySnapshot,
): boolean => {
  if (!isDefined(previousSnapshot)) {
    return false;
  }

  if (
    previousSnapshot.defaultFontShorthand !==
      nextSnapshot.defaultFontShorthand ||
    previousSnapshot.devicePixelRatio !== nextSnapshot.devicePixelRatio
  ) {
    return false;
  }

  return areSnapshotKeysEqualWithinEpsilon(
    previousSnapshot,
    nextSnapshot,
    VIEWPORT_GEOMETRY_PIXEL_KEYS,
  );
};
