import { createElementGeometrySnapshotFixture } from '@/__tests__/createElementGeometrySnapshotFixture';
import { createViewportGeometrySnapshotFixture } from '@/__tests__/createViewportGeometrySnapshotFixture';
import { type MirroredElementState } from '@/polyfills/geometry/types/MirroredElementState';
import { installElementGeometryPolyfill } from '../installElementGeometryPolyfill';

class FakeElement {
  textContent: string | null = null;
}

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
          snapshot: createElementGeometrySnapshotFixture(),
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
          snapshot: createElementGeometrySnapshotFixture(),
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
        getViewportSnapshot: () =>
          createViewportGeometrySnapshotFixture({
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

  it('should place document-scoped rects at the root container host-viewport position', () => {
    const { documentBody, documentElement } = installOn(
      createGeometryStore({
        getViewportSnapshot: () =>
          createViewportGeometrySnapshotFixture({
            rootContainerX: 120,
            rootContainerY: 45,
            rootContainerWidth: 640,
            rootContainerHeight: 480,
          }),
      }),
    );

    const bodyRect = (
      documentBody as unknown as Element
    ).getBoundingClientRect();
    const documentElementRect = (
      documentElement as unknown as Element
    ).getBoundingClientRect();

    expect(bodyRect.x).toBe(120);
    expect(bodyRect.y).toBe(45);
    expect(documentElementRect.x).toBe(120);
    expect(documentElementRect.y).toBe(45);
  });

  it('should mirror host scroll offsets on documentElement only', () => {
    const { documentBody, documentElement } = installOn(
      createGeometryStore({
        getViewportSnapshot: () =>
          createViewportGeometrySnapshotFixture({
            scrollX: 30,
            scrollY: 700,
          }),
      }),
    );

    expect((documentElement as unknown as HTMLElement).scrollTop).toBe(700);
    expect((documentElement as unknown as HTMLElement).scrollLeft).toBe(30);
    expect((documentBody as unknown as HTMLElement).scrollTop).toBe(0);
    expect((documentBody as unknown as HTMLElement).scrollLeft).toBe(0);
  });

  it('should return a single entry array from getClientRects', () => {
    installOn(
      createGeometryStore({
        resolveMirroredElementState: () => ({
          isMirrored: true,
          snapshot: createElementGeometrySnapshotFixture(),
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
          snapshot: createElementGeometrySnapshotFixture(),
        }),
      }),
    );

    const rects = (new FakeElement() as unknown as Element).getClientRects();

    expect(rects.item(0)?.width).toBe(3);
    expect(rects.item(1)).toBeNull();
  });

  it('should return an empty list from getClientRects when no snapshot exists', () => {
    installOn(createGeometryStore());

    const rects = (new FakeElement() as unknown as Element).getClientRects();

    expect(rects).toHaveLength(0);
    expect(rects.item(0)).toBeNull();
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
          snapshot: createElementGeometrySnapshotFixture(),
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
          snapshot: createElementGeometrySnapshotFixture({
            offsetParentRemoteElementId: '9',
          }),
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
          snapshot: createElementGeometrySnapshotFixture({
            offsetParentRemoteElementId: '9',
          }),
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
