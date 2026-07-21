import { isDefined } from 'twenty-shared/utils';

import { GEOMETRY_EPSILON_PIXELS } from '@/host/constants/GeometryEpsilonPixels';
import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';

const ELEMENT_GEOMETRY_KEYS: (keyof ElementGeometrySnapshot)[] = [
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
];

export const isElementGeometryEqualWithinEpsilon = (
  previousSnapshot: ElementGeometrySnapshot | undefined,
  nextSnapshot: ElementGeometrySnapshot,
): boolean => {
  if (!isDefined(previousSnapshot)) {
    return false;
  }

  return ELEMENT_GEOMETRY_KEYS.every(
    (key) =>
      Math.abs(previousSnapshot[key] - nextSnapshot[key]) <
      GEOMETRY_EPSILON_PIXELS,
  );
};
