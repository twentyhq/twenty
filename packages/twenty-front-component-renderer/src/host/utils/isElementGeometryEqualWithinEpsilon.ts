import { isDefined } from 'twenty-shared/utils';

import { areSnapshotKeysEqualWithinEpsilon } from '@/host/utils/areSnapshotKeysEqualWithinEpsilon';
import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';

const ELEMENT_GEOMETRY_NUMERIC_KEYS = [
  'x',
  'y',
  'width',
  'height',
  'offsetWidth',
  'offsetHeight',
  'offsetTop',
  'offsetLeft',
  'clientWidth',
  'clientHeight',
  'clientTop',
  'clientLeft',
  'scrollWidth',
  'scrollHeight',
  'scrollTop',
  'scrollLeft',
] satisfies (keyof ElementGeometrySnapshot)[];

export const isElementGeometryEqualWithinEpsilon = (
  previousSnapshot: ElementGeometrySnapshot | undefined,
  nextSnapshot: ElementGeometrySnapshot,
): boolean => {
  if (!isDefined(previousSnapshot)) {
    return false;
  }

  if (
    previousSnapshot.offsetParentRemoteElementId !==
    nextSnapshot.offsetParentRemoteElementId
  ) {
    return false;
  }

  return areSnapshotKeysEqualWithinEpsilon(
    previousSnapshot,
    nextSnapshot,
    ELEMENT_GEOMETRY_NUMERIC_KEYS,
  );
};
