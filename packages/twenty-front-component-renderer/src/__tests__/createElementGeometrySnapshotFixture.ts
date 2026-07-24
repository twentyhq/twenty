import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';

export const createElementGeometrySnapshotFixture = (
  overrides: Partial<ElementGeometrySnapshot> = {},
): ElementGeometrySnapshot => ({
  x: 1,
  y: 2,
  width: 3,
  height: 4,
  offsetWidth: 5,
  offsetHeight: 6,
  offsetTop: 7,
  offsetLeft: 8,
  clientWidth: 9,
  clientHeight: 10,
  clientTop: 11,
  clientLeft: 12,
  scrollWidth: 13,
  scrollHeight: 14,
  scrollTop: 15,
  scrollLeft: 16,
  offsetParentRemoteElementId: null,
  ...overrides,
});
