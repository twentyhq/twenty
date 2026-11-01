import { createElementGeometrySnapshotFixture } from '@/testing/createElementGeometrySnapshotFixture';
import { createViewportGeometrySnapshotFixture } from '@/testing/createViewportGeometrySnapshotFixture';
import { GEOMETRY_OBSERVATION_LIMIT_WARNING } from '@/polyfills/geometry/constants/GeometryObservationLimitWarning';
import { GEOMETRY_TRANSPORT_FAILURE_WARNING } from '@/polyfills/geometry/constants/GeometryTransportFailureWarning';
import { createWorkerGeometryStore } from '../createWorkerGeometryStore';

const remoteElementIdsByElement = new WeakMap<object, string>();
let nextRemoteElementId = 0;

jest.mock('@remote-dom/core/elements', () => ({
  remoteId: (element: object) => {
    const existingRemoteElementId = remoteElementIdsByElement.get(element);

    if (existingRemoteElementId !== undefined) {
      return existingRemoteElementId;
    }

    const remoteElementId = String(nextRemoteElementId);
    nextRemoteElementId += 1;
    remoteElementIdsByElement.set(element, remoteElementId);

    return remoteElementId;
  },
}));

const createSnapshot = (width: number) =>
  createElementGeometrySnapshotFixture({ width });

const createViewport = (innerWidth: number) =>
  createViewportGeometrySnapshotFixture({ innerWidth });

const flushMicrotasks = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

const createRootedStore = () => {
  const store = createWorkerGeometryStore();
  const documentElement = { localName: 'html', parentNode: null };
  const rootElement = { localName: 'body', parentNode: documentElement };
  store.setRootElement(rootElement);

  return { store, rootElement, documentElement };
};

const createHostElement = (parentNode: object) => ({
  localName: 'html-div',
  parentNode,
});

describe('createWorkerGeometryStore', () => {
  beforeEach(() => {
    nextRemoteElementId = 0;
    jest.restoreAllMocks();
  });

  it('should return null for an element outside the remote root', () => {
    const { store } = createRootedStore();

    expect(store.resolveElementSnapshot({ parentNode: null })).toBeNull();
  });

  it('should not mint a remote id for an element outside the remote root', async () => {
    const { store } = createRootedStore();
    const observeElementGeometry = jest.fn().mockResolvedValue(undefined);
    store.connectTransport({
      observeElementGeometry,
      unobserveElementGeometry: jest.fn().mockResolvedValue(undefined),
    });

    store.resolveElementSnapshot({ parentNode: null });
    await flushMicrotasks();

    expect(observeElementGeometry).not.toHaveBeenCalled();
  });

  it('should enroll an element under the remote root and observe it once', async () => {
    const { store, rootElement } = createRootedStore();
    const observeElementGeometry = jest.fn().mockResolvedValue(undefined);
    store.connectTransport({
      observeElementGeometry,
      unobserveElementGeometry: jest.fn().mockResolvedValue(undefined),
    });

    const element = createHostElement(rootElement);

    store.resolveElementSnapshot(element);
    store.resolveElementSnapshot(element);
    await flushMicrotasks();

    expect(observeElementGeometry).toHaveBeenCalledTimes(1);
    expect(observeElementGeometry).toHaveBeenCalledWith(['0']);
  });

  it('should report an element as measured once a read enrolls it', () => {
    const { store, rootElement } = createRootedStore();
    const element = createHostElement(rootElement);

    expect(store.isElementMeasured(element)).toBe(false);

    store.resolveElementSnapshot(element);

    expect(store.isElementMeasured(element)).toBe(true);
    expect(store.isElementMeasured(rootElement)).toBe(false);
  });

  it('should not enroll the remote root or elements the host renders without a node', async () => {
    const { store, rootElement } = createRootedStore();
    const observeElementGeometry = jest.fn().mockResolvedValue(undefined);
    store.connectTransport({
      observeElementGeometry,
      unobserveElementGeometry: jest.fn().mockResolvedValue(undefined),
    });
    const renderContainer = {
      localName: 'remote-fragment',
      parentNode: rootElement,
    };
    const plainElement = { localName: 'div', parentNode: renderContainer };

    expect(store.resolveElementSnapshot(rootElement)).toBeNull();
    expect(store.resolveElementSnapshot(renderContainer)).toBeNull();
    store.resolveElementSnapshot(plainElement);
    await flushMicrotasks();

    expect(observeElementGeometry).toHaveBeenCalledTimes(1);
    expect(observeElementGeometry).toHaveBeenCalledWith(['0']);
  });

  it('should read an observed snapshot without enrolling unobserved elements', async () => {
    const { store, rootElement } = createRootedStore();
    const observeElementGeometry = jest.fn().mockResolvedValue(undefined);
    store.connectTransport({
      observeElementGeometry,
      unobserveElementGeometry: jest.fn().mockResolvedValue(undefined),
    });
    const element = createHostElement(rootElement);

    expect(store.readObservedElementSnapshot(element)).toBeNull();
    await flushMicrotasks();
    expect(observeElementGeometry).not.toHaveBeenCalled();

    store.resolveElementSnapshot(element);
    store.applyGeometryBatch({ elements: { '0': createSnapshot(42) } });

    expect(store.readObservedElementSnapshot(element)?.width).toBe(42);
  });

  it('should resolve the remote root and its document element from the renderer root container without enrolling them', async () => {
    const { store, rootElement, documentElement } = createRootedStore();
    const observeElementGeometry = jest.fn().mockResolvedValue(undefined);
    store.connectTransport({
      observeElementGeometry,
      unobserveElementGeometry: jest.fn().mockResolvedValue(undefined),
    });

    expect(store.resolveElementSnapshot(rootElement)).toBeNull();

    store.applyGeometryBatch({
      viewport: createViewportGeometrySnapshotFixture({
        computedStyle: { direction: 'rtl' },
        scrollX: 30,
        scrollY: 700,
        rootContainerX: 120,
        rootContainerY: 45,
        rootContainerWidth: 640,
        rootContainerHeight: 480,
        rootContainerClientWidth: 630,
        rootContainerClientHeight: 470,
      }),
    });

    expect(store.resolveElementSnapshot(rootElement)).toMatchObject({
      computedStyle: { direction: 'rtl' },
      x: 120,
      y: 45,
      width: 640,
      height: 480,
      clientWidth: 630,
      clientHeight: 470,
      scrollTop: 0,
      scrollLeft: 0,
    });
    expect(store.readObservedElementSnapshot(documentElement)).toMatchObject({
      x: 120,
      y: 45,
      scrollTop: 700,
      scrollLeft: 30,
    });
    expect(store.createElementGeometryReader(rootElement).read()).toMatchObject(
      { clientWidth: 630, clientHeight: 470 },
    );
    await flushMicrotasks();
    expect(observeElementGeometry).not.toHaveBeenCalled();
  });

  it('should coalesce a synchronous burst of enrollments into one call', async () => {
    const { store, rootElement } = createRootedStore();
    const observeElementGeometry = jest.fn().mockResolvedValue(undefined);
    store.connectTransport({
      observeElementGeometry,
      unobserveElementGeometry: jest.fn().mockResolvedValue(undefined),
    });

    store.resolveElementSnapshot(createHostElement(rootElement));
    store.resolveElementSnapshot(createHostElement(rootElement));
    store.resolveElementSnapshot(createHostElement(rootElement));
    await flushMicrotasks();

    expect(observeElementGeometry).toHaveBeenCalledTimes(1);
    expect(observeElementGeometry).toHaveBeenCalledWith(['0', '1', '2']);
  });

  it('should retain enrollments and flush them when the transport connects later', async () => {
    const { store, rootElement } = createRootedStore();

    store.resolveElementSnapshot(createHostElement(rootElement));
    await flushMicrotasks();

    const observeElementGeometry = jest.fn().mockResolvedValue(undefined);
    store.connectTransport({
      observeElementGeometry,
      unobserveElementGeometry: jest.fn().mockResolvedValue(undefined),
    });

    expect(observeElementGeometry).toHaveBeenCalledWith(['0']);
  });

  it('should return the snapshot after a batch writes it', () => {
    const { store, rootElement } = createRootedStore();
    const element = createHostElement(rootElement);

    store.resolveElementSnapshot(element);
    store.applyGeometryBatch({ elements: { '0': createSnapshot(42) } });

    expect(store.resolveElementSnapshot(element)?.width).toBe(42);
  });

  it('should merge successive batches rather than replacing the element map', () => {
    const { store, rootElement } = createRootedStore();
    const first = createHostElement(rootElement);
    const second = createHostElement(rootElement);

    store.resolveElementSnapshot(first);
    store.resolveElementSnapshot(second);

    store.applyGeometryBatch({ elements: { '0': createSnapshot(1) } });
    store.applyGeometryBatch({ elements: { '1': createSnapshot(2) } });

    expect(store.resolveElementSnapshot(first)?.width).toBe(1);
    expect(store.resolveElementSnapshot(second)?.width).toBe(2);
  });

  it('should delete entries listed in removedRemoteElementIds', () => {
    const { store, rootElement } = createRootedStore();
    const element = createHostElement(rootElement);

    store.resolveElementSnapshot(element);
    store.applyGeometryBatch({ elements: { '0': createSnapshot(5) } });
    store.applyGeometryBatch({ removedRemoteElementIds: ['0'] });

    expect(store.resolveElementSnapshot(element)).toBeNull();
  });

  it('should keep the previous computed style when a batch omits an unchanged one', () => {
    const { store, rootElement } = createRootedStore();
    const element = createHostElement(rootElement);

    store.resolveElementSnapshot(element);
    store.applyGeometryBatch({
      viewport: createViewportGeometrySnapshotFixture({
        computedStyle: { direction: 'rtl' },
      }),
      elements: {
        '0': createElementGeometrySnapshotFixture({
          width: 1,
          computedStyle: { display: 'flex' },
        }),
      },
    });
    store.applyGeometryBatch({
      viewport: createViewportGeometrySnapshotFixture({ innerWidth: 900 }),
      elements: { '0': createElementGeometrySnapshotFixture({ width: 2 }) },
    });

    expect(store.readObservedElementSnapshot(element)).toMatchObject({
      width: 2,
      computedStyle: { display: 'flex' },
    });
    expect(store.getViewportSnapshot()).toMatchObject({
      innerWidth: 900,
      computedStyle: { direction: 'rtl' },
    });
  });

  it('should replace the viewport snapshot on each batch that carries one', () => {
    const { store } = createRootedStore();

    expect(store.getViewportSnapshot()).toBeNull();

    store.applyGeometryBatch({ viewport: createViewport(800) });
    expect(store.getViewportSnapshot()?.innerWidth).toBe(800);

    store.applyGeometryBatch({ viewport: createViewport(1200) });
    expect(store.getViewportSnapshot()?.innerWidth).toBe(1200);
  });

  it('should notify geometry subscribers after each applied batch', () => {
    const { store } = createRootedStore();
    const geometryUpdateListener = jest.fn(() => store.getViewportSnapshot());

    store.subscribeToGeometryUpdates(geometryUpdateListener);

    store.applyGeometryBatch({ elements: { '0': createSnapshot(5) } });
    expect(geometryUpdateListener).toHaveBeenCalledTimes(1);

    store.applyGeometryBatch({ viewport: createViewport(800) });
    expect(geometryUpdateListener).toHaveBeenCalledTimes(2);
    expect(geometryUpdateListener).toHaveLastReturnedWith(createViewport(800));
  });

  it('should stop notifying an unsubscribed geometry listener', () => {
    const { store } = createRootedStore();
    const geometryUpdateListener = jest.fn();

    const unsubscribe = store.subscribeToGeometryUpdates(
      geometryUpdateListener,
    );

    store.applyGeometryBatch({ viewport: createViewport(800) });
    unsubscribe();
    store.applyGeometryBatch({ viewport: createViewport(1200) });

    expect(geometryUpdateListener).toHaveBeenCalledTimes(1);
  });

  it('should stop enrolling once the observation limit is reached', async () => {
    const { store, rootElement } = createRootedStore();
    const observeElementGeometry = jest.fn().mockResolvedValue(undefined);
    store.connectTransport({
      observeElementGeometry,
      unobserveElementGeometry: jest.fn().mockResolvedValue(undefined),
    });
    jest.spyOn(console, 'warn').mockImplementation(() => {});

    for (let index = 0; index < 600; index += 1) {
      store.resolveElementSnapshot(createHostElement(rootElement));
    }
    await flushMicrotasks();

    expect(observeElementGeometry.mock.calls[0][0]).toHaveLength(500);
  });

  it('should warn exactly once about the observation limit', () => {
    const { store, rootElement } = createRootedStore();
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    for (let index = 0; index < 600; index += 1) {
      store.resolveElementSnapshot(createHostElement(rootElement));
    }

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(GEOMETRY_OBSERVATION_LIMIT_WARNING);
  });

  it('should free observation capacity when removedRemoteElementIds prunes ids', async () => {
    const { store, rootElement } = createRootedStore();
    const observeElementGeometry = jest.fn().mockResolvedValue(undefined);
    store.connectTransport({
      observeElementGeometry,
      unobserveElementGeometry: jest.fn().mockResolvedValue(undefined),
    });
    jest.spyOn(console, 'warn').mockImplementation(() => {});

    for (let index = 0; index < 500; index += 1) {
      store.resolveElementSnapshot(createHostElement(rootElement));
    }
    await flushMicrotasks();

    store.resolveElementSnapshot(createHostElement(rootElement));
    await flushMicrotasks();
    expect(observeElementGeometry).toHaveBeenCalledTimes(1);

    store.applyGeometryBatch({ removedRemoteElementIds: ['0', '1'] });

    store.resolveElementSnapshot(createHostElement(rootElement));
    await flushMicrotasks();

    expect(observeElementGeometry).toHaveBeenCalledTimes(2);
  });

  it('should re-enroll an element whose id was pruned by a removal', async () => {
    const { store, rootElement } = createRootedStore();
    const observeElementGeometry = jest.fn().mockResolvedValue(undefined);
    store.connectTransport({
      observeElementGeometry,
      unobserveElementGeometry: jest.fn().mockResolvedValue(undefined),
    });

    const element = createHostElement(rootElement);

    store.resolveElementSnapshot(element);
    await flushMicrotasks();

    store.applyGeometryBatch({ removedRemoteElementIds: ['0'] });

    store.resolveElementSnapshot(element);
    await flushMicrotasks();

    expect(observeElementGeometry).toHaveBeenCalledTimes(2);
    expect(observeElementGeometry).toHaveBeenLastCalledWith(['0']);
  });

  it('should unobserve pruned ids on the host when a removal batch arrives', async () => {
    const { store, rootElement } = createRootedStore();
    const observeElementGeometry = jest.fn().mockResolvedValue(undefined);
    const unobserveElementGeometry = jest.fn().mockResolvedValue(undefined);
    store.connectTransport({
      observeElementGeometry,
      unobserveElementGeometry,
    });

    store.resolveElementSnapshot(createHostElement(rootElement));
    store.resolveElementSnapshot(createHostElement(rootElement));
    await flushMicrotasks();

    store.applyGeometryBatch({ removedRemoteElementIds: ['0', 'unknown'] });

    expect(unobserveElementGeometry).toHaveBeenCalledTimes(1);
    expect(unobserveElementGeometry).toHaveBeenCalledWith(['0']);
  });

  it('should not call unobserve when a removal batch prunes nothing observed', () => {
    const { store } = createRootedStore();
    const unobserveElementGeometry = jest.fn().mockResolvedValue(undefined);
    store.connectTransport({
      observeElementGeometry: jest.fn().mockResolvedValue(undefined),
      unobserveElementGeometry,
    });

    store.applyGeometryBatch({ removedRemoteElementIds: ['unknown'] });

    expect(unobserveElementGeometry).not.toHaveBeenCalled();
  });

  it('should warn once when observeElementGeometry rejects', async () => {
    const { store, rootElement } = createRootedStore();
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    store.connectTransport({
      observeElementGeometry: jest
        .fn()
        .mockRejectedValue(new Error('bridge down')),
      unobserveElementGeometry: jest.fn().mockResolvedValue(undefined),
    });

    store.resolveElementSnapshot(createHostElement(rootElement));
    await flushMicrotasks();

    store.resolveElementSnapshot(createHostElement(rootElement));
    await flushMicrotasks();

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(GEOMETRY_TRANSPORT_FAILURE_WARNING);
  });
});
