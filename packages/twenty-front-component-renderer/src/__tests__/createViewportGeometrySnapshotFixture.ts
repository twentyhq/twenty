import { type ViewportGeometrySnapshot } from '@/types/ViewportGeometrySnapshot';

export const createViewportGeometrySnapshotFixture = (
  overrides: Partial<ViewportGeometrySnapshot> = {},
): ViewportGeometrySnapshot => ({
  innerWidth: 0,
  innerHeight: 0,
  devicePixelRatio: 1,
  scrollX: 0,
  scrollY: 0,
  rootContainerX: 0,
  rootContainerY: 0,
  rootContainerWidth: 0,
  rootContainerHeight: 0,
  rootContainerClientWidth: 0,
  rootContainerClientHeight: 0,
  defaultFontShorthand: '400 13px sans-serif',
  ...overrides,
});
