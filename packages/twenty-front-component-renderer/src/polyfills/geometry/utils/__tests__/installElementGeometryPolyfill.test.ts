import { createElementGeometrySnapshotFixture } from '@/testing/createElementGeometrySnapshotFixture';
import { createSubscriptionStub } from '@/testing/createSubscriptionStub';
import { createWorkerGeometryStoreStub } from '@/testing/createWorkerGeometryStoreStub';
import { type WorkerGeometryStore } from '@/polyfills/geometry/types/WorkerGeometryStore';
import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';
import { installElementGeometryPolyfill } from '../installElementGeometryPolyfill';

class FakeElement {}

class FakeTextarea extends FakeElement {
  localName = 'html-textarea';
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

const createTextareaSnapshot = () =>
  createElementGeometrySnapshotFixture({
    offsetHeight: 50,
    clientHeight: 48,
    scrollHeight: 48,
    textareaIntrinsicScrollHeight: 48,
  });

const installTextareaResizeFixture = ({
  initialSnapshot = createTextareaSnapshot(),
}: {
  initialSnapshot?: ElementGeometrySnapshot | null;
} = {}) => {
  let snapshot = initialSnapshot;
  const geometryUpdates = createSubscriptionStub();

  installOn(
    createWorkerGeometryStoreStub({
      resolveElementSnapshot: () => snapshot,
      subscribeToGeometryUpdates: geometryUpdates.subscribe,
    }),
  );

  const textarea = asPolyfilled(
    new FakeTextarea(),
  ) as GeometryPolyfilledElement & FakeTextarea;
  textarea.style.blockSize = 'auto';

  const resizeToContent = () => {
    textarea.style.blockSize = 'auto';
    const scrollHeight = textarea.scrollHeight;

    if (scrollHeight === 0) {
      return;
    }

    const borderBlockSize = textarea.offsetHeight - textarea.clientHeight;
    textarea.style.blockSize = `${scrollHeight + borderBlockSize}px`;
  };

  const pushSnapshot = (overrides: Partial<ElementGeometrySnapshot>) => {
    snapshot = { ...(snapshot ?? createTextareaSnapshot()), ...overrides };
    geometryUpdates.notify();
  };

  return { textarea, resizeToContent, pushSnapshot };
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
    expect(element.scrollHeight).toBe(14);
    expect(element.clientWidth).toBe(9);
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
    const { textarea, resizeToContent, pushSnapshot } =
      installTextareaResizeFixture();

    resizeToContent();
    pushSnapshot({ textareaIntrinsicScrollHeight: 80 });

    expect(textarea.style.blockSize).toBe('82px');

    pushSnapshot({ textareaIntrinsicScrollHeight: 32 });

    expect(textarea.style.blockSize).toBe('34px');
  });

  it('should keep the automatic block size until the first textarea measurement arrives', () => {
    const { textarea, resizeToContent, pushSnapshot } =
      installTextareaResizeFixture({ initialSnapshot: null });

    resizeToContent();

    expect(textarea.style.blockSize).toBe('auto');

    pushSnapshot({ textareaIntrinsicScrollHeight: 32 });

    expect(textarea.style.blockSize).toBe('34px');
  });

  it('should stop resizing a detached textarea', () => {
    const { textarea, resizeToContent, pushSnapshot } =
      installTextareaResizeFixture();

    resizeToContent();
    textarea.isConnected = false;
    pushSnapshot({});
    pushSnapshot({ textareaIntrinsicScrollHeight: 80 });

    expect(textarea.style.blockSize).toBe('50px');
  });

  it('should preserve caller sizing after a pending textarea content measurement', () => {
    const { textarea, pushSnapshot } = installTextareaResizeFixture();

    expect(textarea.scrollHeight).toBe(48);
    textarea.style.blockSize = '140px';
    pushSnapshot({ textareaIntrinsicScrollHeight: 80 });

    expect(textarea.style.blockSize).toBe('140px');
  });

  it('should return 0 from every numeric getter when no snapshot exists', () => {
    installOn(createWorkerGeometryStoreStub());

    const element = asPolyfilled(new FakeElement());

    expect(element.offsetWidth).toBe(0);
    expect(element.clientHeight).toBe(0);
    expect(element.scrollHeight).toBe(0);
    expect(element.clientLeft).toBe(0);
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
