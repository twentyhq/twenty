import { isDefined } from 'twenty-shared/utils';

import { GEOMETRY_EPSILON_PIXELS } from '@/host/constants/GeometryEpsilonPixels';
import { type ViewportGeometrySnapshot } from '@/types/ViewportGeometrySnapshot';

const VIEWPORT_GEOMETRY_NUMERIC_KEYS: (keyof ViewportGeometrySnapshot)[] = [
  'innerWidth',
  'innerHeight',
  'devicePixelRatio',
  'scrollX',
  'scrollY',
  'rootContainerX',
  'rootContainerY',
  'rootContainerWidth',
  'rootContainerHeight',
  'rootContainerClientWidth',
  'rootContainerClientHeight',
];

export const isViewportGeometryEqualWithinEpsilon = (
  previousSnapshot: ViewportGeometrySnapshot | null,
  nextSnapshot: ViewportGeometrySnapshot,
): boolean => {
  if (!isDefined(previousSnapshot)) {
    return false;
  }

  if (
    previousSnapshot.defaultFontShorthand !== nextSnapshot.defaultFontShorthand
  ) {
    return false;
  }

  return VIEWPORT_GEOMETRY_NUMERIC_KEYS.every((key) => {
    const previousValue = previousSnapshot[key];
    const nextValue = nextSnapshot[key];

    if (typeof previousValue !== 'number' || typeof nextValue !== 'number') {
      return previousValue === nextValue;
    }

    return Math.abs(previousValue - nextValue) < GEOMETRY_EPSILON_PIXELS;
  });
};
