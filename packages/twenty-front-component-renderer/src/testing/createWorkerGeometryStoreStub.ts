import { type WorkerGeometryStore } from '@/polyfills/geometry/types/WorkerGeometryStore';

export const createWorkerGeometryStoreStub = (
  overrides: Partial<WorkerGeometryStore> = {},
): WorkerGeometryStore => ({
  setRootElement: jest.fn(),
  connectTransport: jest.fn(),
  applyGeometryBatch: jest.fn(),
  getViewportSnapshot: jest.fn(() => null),
  subscribeToGeometryUpdates: jest.fn(() => () => {}),
  resolveElementSnapshot: jest.fn(() => null),
  ...overrides,
});
