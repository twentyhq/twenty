import { createViewportGeometrySnapshotFixture } from '@/__tests__/createViewportGeometrySnapshotFixture';
import { type ViewportGeometrySnapshot } from '@/types/ViewportGeometrySnapshot';
import { installWindowGeometryPolyfill } from '../installWindowGeometryPolyfill';

const createViewport = (): ViewportGeometrySnapshot =>
  createViewportGeometrySnapshotFixture({
    innerWidth: 1024,
    innerHeight: 768,
    devicePixelRatio: 2,
    scrollX: 30,
    scrollY: 40,
  });

const createGeometryStore = (
  getViewportSnapshot: () => ViewportGeometrySnapshot | null,
) =>
  ({
    setRootElement: jest.fn(),
    connectTransport: jest.fn(),
    applyGeometryBatch: jest.fn(),
    getViewportSnapshot,
    resolveMirroredElementState: () => ({ isMirrored: false, snapshot: null }),
    resolveElementByRemoteElementId: () => null,
  }) as never;

describe('installWindowGeometryPolyfill', () => {
  it('should define the properties on both the global scope and a distinct window', () => {
    const polyfillWindow: Record<string, unknown> = {};
    const globalScope: Record<string, unknown> = { window: polyfillWindow };

    installWindowGeometryPolyfill({
      globalScope,
      geometryStore: createGeometryStore(createViewport),
    });

    expect(globalScope.innerWidth).toBe(1024);
    expect(polyfillWindow.innerWidth).toBe(1024);
    expect(polyfillWindow.devicePixelRatio).toBe(2);
    expect(globalScope.scrollX).toBe(30);
    expect(polyfillWindow.scrollY).toBe(40);
    expect(globalScope.pageXOffset).toBe(30);
    expect(polyfillWindow.pageYOffset).toBe(40);
  });

  it('should fall back to zero sizes and a device pixel ratio of one before the first push', () => {
    const globalScope: Record<string, unknown> = {};

    installWindowGeometryPolyfill({
      globalScope,
      geometryStore: createGeometryStore(() => null),
    });

    expect(globalScope.innerWidth).toBe(0);
    expect(globalScope.innerHeight).toBe(0);
    expect(globalScope.devicePixelRatio).toBe(1);
    expect(globalScope.scrollX).toBe(0);
    expect(globalScope.pageYOffset).toBe(0);
  });

  it('should reflect a later viewport push without reinstalling', () => {
    let viewport: ViewportGeometrySnapshot | null = null;
    const globalScope: Record<string, unknown> = {};

    installWindowGeometryPolyfill({
      globalScope,
      geometryStore: createGeometryStore(() => viewport),
    });

    expect(globalScope.innerWidth).toBe(0);

    viewport = createViewport();

    expect(globalScope.innerWidth).toBe(1024);
  });
});
