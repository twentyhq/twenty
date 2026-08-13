import { type WorkerGeometryStore } from '@/polyfills/geometry/types/WorkerGeometryStore';

export const createWorkerGeometryStoreStub = (
  overrides: Partial<WorkerGeometryStore> = {},
): WorkerGeometryStore => ({
  setRootElement: jest.fn(),
  connectTransport: jest.fn(),
  applyGeometryBatch: jest.fn(),
  getViewportSnapshot: jest.fn(() => null),
  subscribeToViewportUpdates: jest.fn(() => () => {}),
  resolveElementSnapshot: jest.fn(() => null),
  ...overrides,
});
