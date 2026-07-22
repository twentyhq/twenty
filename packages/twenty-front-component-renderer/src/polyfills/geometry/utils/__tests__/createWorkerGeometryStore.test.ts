import { createElementGeometrySnapshotFixture } from '@/__tests__/createElementGeometrySnapshotFixture';
import { createViewportGeometrySnapshotFixture } from '@/__tests__/createViewportGeometrySnapshotFixture';
import { GEOMETRY_OBSERVATION_LIMIT_WARNING } from '@/polyfills/geometry/constants/GeometryObservationLimitWarning';
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

const flushMicrotasks = () => Promise.resolve();

const createRootedStore = () => {
  const store = createWorkerGeometryStore();
  const rootElement = { parentNode: null };
  store.setRootElement(rootElement);

  return { store, rootElement };
};

describe('createWorkerGeometryStore', () => {
  beforeEach(() => {
    nextRemoteElementId = 0;
    jest.restoreAllMocks();
  });

  it('should return null for an element outside the remote root', () => {
    const { store } = createRootedStore();

    expect(
      store.resolveMirroredElementState({ parentNode: null }).snapshot,
    ).toBeNull();
  });

  it('should not mint a remote id for an element outside the remote root', async () => {
    const { store } = createRootedStore();
    const observeElementGeometry = jest.fn().mockResolvedValue(undefined);
    store.connectTransport({
      observeElementGeometry,
      unobserveElementGeometry: jest.fn().mockResolvedValue(undefined),
    });

    store.resolveMirroredElementState({ parentNode: null });
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

    const element = { parentNode: rootElement };

    store.resolveMirroredElementState(element);
    store.resolveMirroredElementState(element);
    await flushMicrotasks();

    expect(observeElementGeometry).toHaveBeenCalledTimes(1);
    expect(observeElementGeometry).toHaveBeenCalledWith(['0']);
  });

  it('should coalesce a synchronous burst of enrollments into one call', async () => {
    const { store, rootElement } = createRootedStore();
    const observeElementGeometry = jest.fn().mockResolvedValue(undefined);
    store.connectTransport({
      observeElementGeometry,
      unobserveElementGeometry: jest.fn().mockResolvedValue(undefined),
    });

    store.resolveMirroredElementState({ parentNode: rootElement });
    store.resolveMirroredElementState({ parentNode: rootElement });
    store.resolveMirroredElementState({ parentNode: rootElement });
    await flushMicrotasks();

    expect(observeElementGeometry).toHaveBeenCalledTimes(1);
    expect(observeElementGeometry).toHaveBeenCalledWith(['0', '1', '2']);
  });

  it('should retain enrollments and flush them when the transport connects later', async () => {
    const { store, rootElement } = createRootedStore();

    store.resolveMirroredElementState({ parentNode: rootElement });
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
    const element = { parentNode: rootElement };

    store.resolveMirroredElementState(element);
    store.applyGeometryBatch({ elements: { '0': createSnapshot(42) } });

    expect(store.resolveMirroredElementState(element).snapshot?.width).toBe(42);
  });

  it('should merge successive batches rather than replacing the element map', () => {
    const { store, rootElement } = createRootedStore();
    const first = { parentNode: rootElement };
    const second = { parentNode: rootElement };

    store.resolveMirroredElementState(first);
    store.resolveMirroredElementState(second);

    store.applyGeometryBatch({ elements: { '0': createSnapshot(1) } });
    store.applyGeometryBatch({ elements: { '1': createSnapshot(2) } });

    expect(store.resolveMirroredElementState(first).snapshot?.width).toBe(1);
    expect(store.resolveMirroredElementState(second).snapshot?.width).toBe(2);
  });

  it('should delete entries listed in removedRemoteElementIds', () => {
    const { store, rootElement } = createRootedStore();
    const element = { parentNode: rootElement };

    store.resolveMirroredElementState(element);
    store.applyGeometryBatch({ elements: { '0': createSnapshot(5) } });
    store.applyGeometryBatch({ removedRemoteElementIds: ['0'] });

    expect(store.resolveMirroredElementState(element).snapshot).toBeNull();
  });

  it('should replace the viewport snapshot on each batch that carries one', () => {
    const { store } = createRootedStore();

    expect(store.getViewportSnapshot()).toBeNull();

    store.applyGeometryBatch({ viewport: createViewport(800) });
    expect(store.getViewportSnapshot()?.innerWidth).toBe(800);

    store.applyGeometryBatch({ viewport: createViewport(1200) });
    expect(store.getViewportSnapshot()?.innerWidth).toBe(1200);
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
      store.resolveMirroredElementState({ parentNode: rootElement });
    }
    await flushMicrotasks();

    expect(observeElementGeometry.mock.calls[0][0]).toHaveLength(500);
  });

  it('should warn exactly once about the observation limit', () => {
    const { store, rootElement } = createRootedStore();
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    for (let index = 0; index < 600; index += 1) {
      store.resolveMirroredElementState({ parentNode: rootElement });
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
      store.resolveMirroredElementState({ parentNode: rootElement });
    }
    await flushMicrotasks();

    store.resolveMirroredElementState({ parentNode: rootElement });
    await flushMicrotasks();
    expect(observeElementGeometry).toHaveBeenCalledTimes(1);

    store.applyGeometryBatch({ removedRemoteElementIds: ['0', '1'] });

    store.resolveMirroredElementState({ parentNode: rootElement });
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

    const element = { parentNode: rootElement };

    store.resolveMirroredElementState(element);
    await flushMicrotasks();

    store.applyGeometryBatch({ removedRemoteElementIds: ['0'] });

    store.resolveMirroredElementState(element);
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

    store.resolveMirroredElementState({ parentNode: rootElement });
    store.resolveMirroredElementState({ parentNode: rootElement });
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

  it('should resolve an enrolled element by its remote element id', () => {
    const { store, rootElement } = createRootedStore();
    const element = { parentNode: rootElement };

    store.resolveMirroredElementState(element);

    expect(store.resolveElementByRemoteElementId('0')).toBe(element);
    expect(store.resolveElementByRemoteElementId('404')).toBeNull();
  });

  it('should stop resolving an element after its id is removed', () => {
    const { store, rootElement } = createRootedStore();
    const element = { parentNode: rootElement };

    store.resolveMirroredElementState(element);
    store.applyGeometryBatch({ removedRemoteElementIds: ['0'] });

    expect(store.resolveElementByRemoteElementId('0')).toBeNull();
  });

  it('should report an element under the remote root as mirrored', () => {
    const { store, rootElement } = createRootedStore();

    expect(
      store.resolveMirroredElementState({ parentNode: rootElement }).isMirrored,
    ).toBe(true);
    expect(
      store.resolveMirroredElementState({ parentNode: null }).isMirrored,
    ).toBe(false);
  });
});
