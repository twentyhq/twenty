import { createElementGeometrySnapshotFixture } from '@/testing/createElementGeometrySnapshotFixture';
import { createViewportGeometrySnapshotFixture } from '@/testing/createViewportGeometrySnapshotFixture';
import { createWorkerGeometryStoreStub } from '@/testing/createWorkerGeometryStoreStub';
import { type WorkerGeometryStore } from '@/polyfills/geometry/types/WorkerGeometryStore';
import { installElementGeometryPolyfill } from '../installElementGeometryPolyfill';

class FakeElement {}

class FakeTextarea extends FakeElement {
  tagName = 'HTML-TEXTAREA';
  isConnected = true;
  style = { blockSize: '' };
}

type GeometryPolyfilledElement = FakeElement & {
  getBoundingClientRect: () => DOMRect;
  offsetWidth: number;
  offsetHeight: number;
  offsetTop: number;
  offsetLeft: number;
  clientWidth: number;
  clientHeight: number;
  clientTop: number;
  clientLeft: number;
  scrollWidth: number;
  scrollHeight: number;
  scrollTop: number;
  scrollLeft: number;
  offsetParent: FakeElement | null;
};

const asPolyfilled = (element: FakeElement) =>
  element as GeometryPolyfilledElement;

const installOn = (geometryStore: WorkerGeometryStore) => {
  const documentBody = new FakeElement();
  const documentElement = new FakeElement();

  installElementGeometryPolyfill({
    elementPrototype: FakeElement.prototype,
    documentTarget: { body: documentBody, documentElement },
    geometryStore,
  });

  return { documentBody, documentElement };
};

describe('installElementGeometryPolyfill', () => {
  it('should return a zero rect when the store has no snapshot', () => {
    installOn(createWorkerGeometryStoreStub());

    const element = asPolyfilled(new FakeElement());

    expect(() => element.getBoundingClientRect()).not.toThrow();
    expect(element.getBoundingClientRect().width).toBe(0);
  });

  it('should return the mirrored rect when the store resolves a snapshot', () => {
    installOn(
      createWorkerGeometryStoreStub({
        resolveElementSnapshot: () => createElementGeometrySnapshotFixture(),
      }),
    );

    const rect = asPolyfilled(new FakeElement()).getBoundingClientRect();

    expect(rect.x).toBe(1);
    expect(rect.width).toBe(3);
    expect(rect.bottom).toBe(6);
  });

  it('should expose the mirrored numeric metrics when the store resolves a snapshot', () => {
    installOn(
      createWorkerGeometryStoreStub({
        resolveElementSnapshot: () => createElementGeometrySnapshotFixture(),
      }),
    );

    const element = asPolyfilled(new FakeElement());

    expect(element.offsetWidth).toBe(5);
    expect(element.clientHeight).toBe(10);
    expect(element.scrollWidth).toBe(13);
    expect(element.scrollTop).toBe(15);
  });

  it('should measure content when a textarea resets its block size', () => {
    installOn(
      createWorkerGeometryStoreStub({
        resolveElementSnapshot: () =>
          createElementGeometrySnapshotFixture({
            scrollHeight: 130,
            textareaIntrinsicScrollHeight: 48,
          }),
      }),
    );

    const textarea = asPolyfilled(
      new FakeTextarea(),
    ) as GeometryPolyfilledElement & FakeTextarea;
    textarea.style.blockSize = 'auto';

    expect(textarea.scrollHeight).toBe(48);
    textarea.style.blockSize = '100px';
    expect(textarea.scrollHeight).toBe(130);
  });

  it('should resize a textarea after its controlled content reaches the host', () => {
    let snapshot = createElementGeometrySnapshotFixture({
      offsetHeight: 50,
      clientHeight: 48,
      scrollHeight: 48,
      textareaIntrinsicScrollHeight: 48,
    });
    let notifyGeometryUpdate = () => {};

    installOn(
      createWorkerGeometryStoreStub({
        resolveElementSnapshot: () => snapshot,
        subscribeToGeometryUpdates: (listener) => {
          notifyGeometryUpdate = listener;
          return () => {};
        },
      }),
    );

    const textarea = asPolyfilled(
      new FakeTextarea(),
    ) as GeometryPolyfilledElement & FakeTextarea;
    textarea.style.blockSize = 'auto';
    const borderBlockSize = textarea.offsetHeight - textarea.clientHeight;
    textarea.style.blockSize = `${textarea.scrollHeight + borderBlockSize}px`;
    snapshot = { ...snapshot, textareaIntrinsicScrollHeight: 80 };
    notifyGeometryUpdate();

    expect(textarea.style.blockSize).toBe('82px');

    snapshot = { ...snapshot, textareaIntrinsicScrollHeight: 32 };
    notifyGeometryUpdate();

    expect(textarea.style.blockSize).toBe('34px');
  });

  it('should stop resizing a detached textarea', () => {
    let snapshot = createElementGeometrySnapshotFixture({
      offsetHeight: 50,
      clientHeight: 48,
      scrollHeight: 48,
      textareaIntrinsicScrollHeight: 48,
    });
    let notifyGeometryUpdate = () => {};

    installOn(
      createWorkerGeometryStoreStub({
        resolveElementSnapshot: () => snapshot,
        subscribeToGeometryUpdates: (listener) => {
          notifyGeometryUpdate = listener;
          return () => {};
        },
      }),
    );

    const textarea = asPolyfilled(
      new FakeTextarea(),
    ) as GeometryPolyfilledElement & FakeTextarea;
    textarea.style.blockSize = 'auto';
    const borderBlockSize = textarea.offsetHeight - textarea.clientHeight;
    textarea.style.blockSize = `${textarea.scrollHeight + borderBlockSize}px`;
    textarea.isConnected = false;
    notifyGeometryUpdate();
    snapshot = createElementGeometrySnapshotFixture({
      textareaIntrinsicScrollHeight: 80,
    });
    notifyGeometryUpdate();

    expect(textarea.style.blockSize).toBe('50px');
  });

  it('should preserve caller sizing after a pending textarea content measurement', () => {
    let snapshot = createElementGeometrySnapshotFixture({
      offsetHeight: 50,
      clientHeight: 48,
      scrollHeight: 48,
      textareaIntrinsicScrollHeight: 48,
    });
    let notifyGeometryUpdate = () => {};

    installOn(
      createWorkerGeometryStoreStub({
        resolveElementSnapshot: () => snapshot,
        subscribeToGeometryUpdates: (listener) => {
          notifyGeometryUpdate = listener;
          return () => {};
        },
      }),
    );

    const textarea = asPolyfilled(
      new FakeTextarea(),
    ) as GeometryPolyfilledElement & FakeTextarea;
    textarea.style.blockSize = 'auto';
    expect(textarea.scrollHeight).toBe(48);
    textarea.style.blockSize = '140px';
    snapshot = { ...snapshot, textareaIntrinsicScrollHeight: 80 };
    notifyGeometryUpdate();

    expect(textarea.style.blockSize).toBe('140px');
  });

  it('should return 0 from every numeric getter when no snapshot exists', () => {
    installOn(createWorkerGeometryStoreStub());

    const element = asPolyfilled(new FakeElement());

    expect(element.offsetWidth).toBe(0);
    expect(element.clientHeight).toBe(0);
    expect(element.scrollLeft).toBe(0);
  });

  it('should synthesize body geometry from the viewport root container', () => {
    const { documentBody } = installOn(
      createWorkerGeometryStoreStub({
        getViewportSnapshot: () =>
          createViewportGeometrySnapshotFixture({
            rootContainerWidth: 640,
            rootContainerHeight: 480,
            rootContainerClientWidth: 630,
            rootContainerClientHeight: 470,
          }),
      }),
    );

    const rect = asPolyfilled(documentBody).getBoundingClientRect();

    expect(rect.width).toBe(640);
    expect(rect.height).toBe(480);
    expect(asPolyfilled(documentBody).clientWidth).toBe(630);
  });

  it('should place document-scoped rects at the root container host-viewport position', () => {
    const { documentBody, documentElement } = installOn(
      createWorkerGeometryStoreStub({
        getViewportSnapshot: () =>
          createViewportGeometrySnapshotFixture({
            rootContainerX: 120,
            rootContainerY: 45,
            rootContainerWidth: 640,
            rootContainerHeight: 480,
          }),
      }),
    );

    const bodyRect = asPolyfilled(documentBody).getBoundingClientRect();
    const documentElementRect =
      asPolyfilled(documentElement).getBoundingClientRect();

    expect(bodyRect.x).toBe(120);
    expect(bodyRect.y).toBe(45);
    expect(documentElementRect.x).toBe(120);
    expect(documentElementRect.y).toBe(45);
  });

  it('should mirror host scroll offsets on documentElement only', () => {
    const { documentBody, documentElement } = installOn(
      createWorkerGeometryStoreStub({
        getViewportSnapshot: () =>
          createViewportGeometrySnapshotFixture({
            scrollX: 30,
            scrollY: 700,
          }),
      }),
    );

    expect(asPolyfilled(documentElement).scrollTop).toBe(700);
    expect(asPolyfilled(documentElement).scrollLeft).toBe(30);
    expect(asPolyfilled(documentBody).scrollTop).toBe(0);
    expect(asPolyfilled(documentBody).scrollLeft).toBe(0);
  });

  it('should return zero document-scoped geometry when no viewport snapshot exists', () => {
    const { documentBody } = installOn(createWorkerGeometryStoreStub());

    expect(asPolyfilled(documentBody).getBoundingClientRect().width).toBe(0);
    expect(asPolyfilled(documentBody).clientWidth).toBe(0);
  });

  it('should not throw when scrollTop is assigned and should keep reading the mirrored value', () => {
    installOn(
      createWorkerGeometryStoreStub({
        resolveElementSnapshot: () => createElementGeometrySnapshotFixture(),
      }),
    );

    const element = asPolyfilled(new FakeElement());

    expect(() => {
      element.scrollTop = 999;
    }).not.toThrow();
    expect(element.scrollTop).toBe(15);
  });

  it('should return the document body from offsetParent', () => {
    const { documentBody } = installOn(createWorkerGeometryStoreStub());

    expect(asPolyfilled(new FakeElement()).offsetParent).toBe(documentBody);
  });

  it('should return null from offsetParent for the body and document element so offset parent walks terminate', () => {
    const { documentBody, documentElement } = installOn(
      createWorkerGeometryStoreStub(),
    );

    expect(asPolyfilled(documentBody).offsetParent).toBeNull();
    expect(asPolyfilled(documentElement).offsetParent).toBeNull();
  });

  it('should return a zero rect when snapshot resolution throws', () => {
    installOn(
      createWorkerGeometryStoreStub({
        resolveElementSnapshot: () => {
          throw new Error('boom');
        },
      }),
    );

    const element = asPolyfilled(new FakeElement());

    expect(() => element.getBoundingClientRect()).not.toThrow();
    expect(element.getBoundingClientRect().width).toBe(0);
  });
});
