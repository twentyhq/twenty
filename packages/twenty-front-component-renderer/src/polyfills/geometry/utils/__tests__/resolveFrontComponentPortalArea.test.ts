import { FRONT_COMPONENT_PORTAL_MARGIN } from '@/constants/FrontComponentPortalMargin';
import { createViewportGeometrySnapshotFixture } from '@/testing/createViewportGeometrySnapshotFixture';
import { resolveFrontComponentPortalArea } from '../resolveFrontComponentPortalArea';

describe('resolveFrontComponentPortalArea', () => {
  it('should be empty before the first viewport push', () => {
    expect(resolveFrontComponentPortalArea(null)).toEqual({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    });
  });

  it('should extend the component box by the portal margin on every side', () => {
    const portalArea = resolveFrontComponentPortalArea(
      createViewportGeometrySnapshotFixture({
        innerWidth: 1600,
        innerHeight: 1200,
        rootContainerX: 500,
        rootContainerY: 400,
        rootContainerWidth: 320,
        rootContainerHeight: 180,
      }),
    );

    expect(portalArea).toEqual({
      x: 500 - FRONT_COMPONENT_PORTAL_MARGIN,
      y: 400 - FRONT_COMPONENT_PORTAL_MARGIN,
      width: 320 + 2 * FRONT_COMPONENT_PORTAL_MARGIN,
      height: 180 + 2 * FRONT_COMPONENT_PORTAL_MARGIN,
    });
  });

  it('should stop at the edges of the host viewport', () => {
    const portalArea = resolveFrontComponentPortalArea(
      createViewportGeometrySnapshotFixture({
        innerWidth: 800,
        innerHeight: 600,
        rootContainerX: 40,
        rootContainerY: 500,
        rootContainerWidth: 700,
        rootContainerHeight: 300,
      }),
    );

    expect(portalArea).toEqual({
      x: 0,
      y: 500 - FRONT_COMPONENT_PORTAL_MARGIN,
      width: 800,
      height: 600 - (500 - FRONT_COMPONENT_PORTAL_MARGIN),
    });
  });

  it('should be empty when the component is entirely outside the host viewport', () => {
    const portalArea = resolveFrontComponentPortalArea(
      createViewportGeometrySnapshotFixture({
        innerWidth: 800,
        innerHeight: 600,
        rootContainerX: 100,
        rootContainerY: 600 + FRONT_COMPONENT_PORTAL_MARGIN + 50,
        rootContainerWidth: 320,
        rootContainerHeight: 180,
      }),
    );

    expect(portalArea.height).toBe(0);
  });
});
