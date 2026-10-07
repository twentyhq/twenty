import { FRONT_COMPONENT_PORTAL_MARGIN } from '@/constants/FrontComponentPortalMargin';
import { createViewportGeometrySnapshotFixture } from '@/testing/createViewportGeometrySnapshotFixture';
import { createWorkerGeometryStoreStub } from '@/testing/createWorkerGeometryStoreStub';
import { type ViewportGeometrySnapshot } from '@/types/ViewportGeometrySnapshot';
import { installVisualViewportPolyfill } from '../installVisualViewportPolyfill';

type InstalledVisualViewport = EventTarget & {
  offsetLeft: number;
  offsetTop: number;
  pageLeft: number;
  pageTop: number;
  width: number;
  height: number;
  scale: number;
};

const createViewport = (
  overrides: Partial<ViewportGeometrySnapshot> = {},
): ViewportGeometrySnapshot =>
  createViewportGeometrySnapshotFixture({
    innerWidth: 1600,
    innerHeight: 1200,
    scrollX: 30,
    scrollY: 40,
    rootContainerX: 500,
    rootContainerY: 400,
    rootContainerWidth: 320,
    rootContainerHeight: 180,
    ...overrides,
  });

const installWithGeometryUpdates = (
  readViewport: () => ViewportGeometrySnapshot | null,
) => {
  let notifyGeometryUpdate: () => void = () => {};
  const polyfillWindow: Record<string, unknown> = {};
  const globalScope: Record<string, unknown> = { window: polyfillWindow };

  installVisualViewportPolyfill({
    globalScope,
    geometryStore: createWorkerGeometryStoreStub({
      getViewportSnapshot: readViewport,
      subscribeToGeometryUpdates: (listener) => {
        notifyGeometryUpdate = listener;

        return () => {};
      },
    }),
  });

  return {
    globalScope,
    polyfillWindow,
    visualViewport: globalScope.visualViewport as InstalledVisualViewport,
    notifyGeometryUpdate: () => notifyGeometryUpdate(),
  };
};

describe('installVisualViewportPolyfill', () => {
  it('should report the area where body portals are visible on both the global scope and a distinct window', () => {
    const { polyfillWindow, visualViewport } = installWithGeometryUpdates(() =>
      createViewport(),
    );

    expect(polyfillWindow.visualViewport).toBe(visualViewport);
    expect(visualViewport.offsetLeft).toBe(500 - FRONT_COMPONENT_PORTAL_MARGIN);
    expect(visualViewport.offsetTop).toBe(400 - FRONT_COMPONENT_PORTAL_MARGIN);
    expect(visualViewport.width).toBe(320 + 2 * FRONT_COMPONENT_PORTAL_MARGIN);
    expect(visualViewport.height).toBe(180 + 2 * FRONT_COMPONENT_PORTAL_MARGIN);
    expect(visualViewport.pageLeft).toBe(
      30 + 500 - FRONT_COMPONENT_PORTAL_MARGIN,
    );
    expect(visualViewport.pageTop).toBe(
      40 + 400 - FRONT_COMPONENT_PORTAL_MARGIN,
    );
    expect(visualViewport.scale).toBe(1);
  });

  it('should notify viewport listeners after every geometry update so positioned popups recompute', () => {
    let viewport = createViewport();
    const { visualViewport, notifyGeometryUpdate } = installWithGeometryUpdates(
      () => viewport,
    );
    const scrollListener = jest.fn();
    const resizeListener = jest.fn();
    visualViewport.addEventListener('scroll', scrollListener);
    visualViewport.addEventListener('resize', resizeListener);

    notifyGeometryUpdate();
    viewport = createViewport({ rootContainerY: 420 });
    notifyGeometryUpdate();

    expect(scrollListener).toHaveBeenCalledTimes(2);
    expect(resizeListener).not.toHaveBeenCalled();

    viewport = createViewport({ rootContainerHeight: 240 });
    notifyGeometryUpdate();

    expect(resizeListener).toHaveBeenCalledTimes(1);
    expect(scrollListener).toHaveBeenCalledTimes(2);
  });

  it('should reflect a later viewport push without reinstalling', () => {
    let viewport: ViewportGeometrySnapshot | null = null;
    const { visualViewport } = installWithGeometryUpdates(() => viewport);

    expect(visualViewport.width).toBe(0);

    viewport = createViewport();

    expect(visualViewport.width).toBe(320 + 2 * FRONT_COMPONENT_PORTAL_MARGIN);
  });
});
