import { type MirroredElementState } from '@/polyfills/geometry/types/MirroredElementState';
import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';
import { installElementGeometryPolyfill } from '../installElementGeometryPolyfill';

class FakeElement {
  textContent: string | null = null;
}

const createSnapshot = (
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

const createGeometryStore = (
  overrides: Partial<{
    resolveMirroredElementState: (element: object) => MirroredElementState;
    resolveElementByRemoteElementId: (remoteElementId: string) => object | null;
    getViewportSnapshot: () => ReturnType<() => Record<string, unknown>> | null;
  }> = {},
) =>
  ({
    setRootElement: jest.fn(),
    connectTransport: jest.fn(),
    applyGeometryBatch: jest.fn(),
    getViewportSnapshot: overrides.getViewportSnapshot ?? (() => null),
    resolveMirroredElementState:
      overrides.resolveMirroredElementState ??
      (() => ({ isMirrored: false, snapshot: null })),
    resolveElementByRemoteElementId:
      overrides.resolveElementByRemoteElementId ?? (() => null),
  }) as never;

const installOn = (
  geometryStore: never,
  measureElementTextGeometry: Parameters<
    typeof installElementGeometryPolyfill
  >[0]['measureElementTextGeometry'] = null,
) => {
  const documentBody = new FakeElement();
  const documentElement = new FakeElement();

  installElementGeometryPolyfill({
    elementPrototype: FakeElement.prototype,
    documentTarget: { body: documentBody, documentElement },
    geometryStore,
    measureElementTextGeometry,
  });

  return { documentBody, documentElement };
};

describe('installElementGeometryPolyfill', () => {
  it('should return a zero rect before any push and not throw', () => {
    installOn(createGeometryStore());

    const element = new FakeElement() as unknown as Element;

    expect(() => element.getBoundingClientRect()).not.toThrow();
    expect(element.getBoundingClientRect().width).toBe(0);
  });

  it('should return the mirrored rect after a push', () => {
    installOn(
      createGeometryStore({
        resolveMirroredElementState: () => ({
          isMirrored: true,
          snapshot: createSnapshot(),
        }),
      }),
    );

    const rect = (
      new FakeElement() as unknown as Element
    ).getBoundingClientRect();

    expect(rect.x).toBe(1);
    expect(rect.width).toBe(3);
    expect(rect.bottom).toBe(6);
  });

  it('should expose the mirrored numeric metrics', () => {
    installOn(
      createGeometryStore({
        resolveMirroredElementState: () => ({
          isMirrored: true,
          snapshot: createSnapshot(),
        }),
      }),
    );

    const element = new FakeElement() as unknown as HTMLElement;

    expect(element.offsetWidth).toBe(5);
    expect(element.clientHeight).toBe(10);
    expect(element.scrollWidth).toBe(13);
    expect(element.scrollTop).toBe(15);
  });

  it('should return 0 from every numeric getter when no snapshot exists', () => {
    installOn(createGeometryStore());

    const element = new FakeElement() as unknown as HTMLElement;

    expect(element.offsetWidth).toBe(0);
    expect(element.clientHeight).toBe(0);
    expect(element.scrollLeft).toBe(0);
  });

  it('should synthesize body geometry from the viewport root container', () => {
    const { documentBody } = installOn(
      createGeometryStore({
        getViewportSnapshot: () => ({
          rootContainerWidth: 640,
          rootContainerHeight: 480,
          rootContainerClientWidth: 630,
          rootContainerClientHeight: 470,
        }),
      }),
    );

    const rect = (documentBody as unknown as Element).getBoundingClientRect();

    expect(rect.width).toBe(640);
    expect(rect.height).toBe(480);
    expect((documentBody as unknown as HTMLElement).clientWidth).toBe(630);
  });

  it('should return a single entry array from getClientRects', () => {
    installOn(
      createGeometryStore({
        resolveMirroredElementState: () => ({
          isMirrored: true,
          snapshot: createSnapshot(),
        }),
      }),
    );

    const rects = (new FakeElement() as unknown as Element).getClientRects();

    expect(rects).toHaveLength(1);
    expect(rects[0].width).toBe(3);
  });

  it('should expose item on getClientRects', () => {
    installOn(
      createGeometryStore({
        resolveMirroredElementState: () => ({
          isMirrored: true,
          snapshot: createSnapshot(),
        }),
      }),
    );

    const rects = (new FakeElement() as unknown as Element).getClientRects();

    expect(rects.item(0)?.width).toBe(3);
    expect(rects.item(1)).toBeNull();
  });

  it('should fall back to text measurement for an element outside the remote root', () => {
    installOn(createGeometryStore(), () => ({ width: 120, height: 16 }));

    const element = new FakeElement();
    element.textContent = 'hello';

    const rect = (element as unknown as Element).getBoundingClientRect();

    expect(rect.width).toBe(120);
    expect(rect.height).toBe(16);
  });

  it('should not fall back to text measurement for a mirrored element', () => {
    installOn(
      createGeometryStore({
        resolveMirroredElementState: () => ({
          isMirrored: true,
          snapshot: null,
        }),
      }),
      () => ({
        width: 120,
        height: 16,
      }),
    );

    const element = new FakeElement();
    element.textContent = 'hello';

    expect((element as unknown as Element).getBoundingClientRect().width).toBe(
      0,
    );
  });

  it('should not throw when scrollTop is assigned and should keep reading the mirrored value', () => {
    installOn(
      createGeometryStore({
        resolveMirroredElementState: () => ({
          isMirrored: true,
          snapshot: createSnapshot(),
        }),
      }),
    );

    const element = new FakeElement() as unknown as HTMLElement;

    expect(() => {
      element.scrollTop = 999;
    }).not.toThrow();
    expect(element.scrollTop).toBe(15);
  });

  it('should return the document body from offsetParent for a mirrored element', () => {
    const { documentBody } = installOn(
      createGeometryStore({
        resolveMirroredElementState: () => ({
          isMirrored: true,
          snapshot: null,
        }),
      }),
    );

    expect((new FakeElement() as unknown as HTMLElement).offsetParent).toBe(
      documentBody,
    );
  });

  it('should resolve offsetParent through the mirrored parent id', () => {
    const mirroredParent = new FakeElement();
    installOn(
      createGeometryStore({
        resolveMirroredElementState: () => ({
          isMirrored: true,
          snapshot: createSnapshot({ offsetParentRemoteElementId: '9' }),
        }),
        resolveElementByRemoteElementId: (remoteElementId) =>
          remoteElementId === '9' ? mirroredParent : null,
      }),
    );

    expect((new FakeElement() as unknown as HTMLElement).offsetParent).toBe(
      mirroredParent,
    );
  });

  it('should fall back to the document body when the parent id cannot be resolved', () => {
    const { documentBody } = installOn(
      createGeometryStore({
        resolveMirroredElementState: () => ({
          isMirrored: true,
          snapshot: createSnapshot({ offsetParentRemoteElementId: '9' }),
        }),
      }),
    );

    expect((new FakeElement() as unknown as HTMLElement).offsetParent).toBe(
      documentBody,
    );
  });

  it('should return null from offsetParent for a non mirrored element', () => {
    installOn(createGeometryStore());

    expect(
      (new FakeElement() as unknown as HTMLElement).offsetParent,
    ).toBeNull();
  });

  it('should return a zero rect when snapshot resolution throws', () => {
    installOn(
      createGeometryStore({
        resolveMirroredElementState: () => {
          throw new Error('boom');
        },
      }),
    );

    const element = new FakeElement() as unknown as Element;

    expect(() => element.getBoundingClientRect()).not.toThrow();
    expect(element.getBoundingClientRect().width).toBe(0);
  });
});
