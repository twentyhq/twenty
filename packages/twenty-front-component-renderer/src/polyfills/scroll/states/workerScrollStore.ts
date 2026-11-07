import { workerGeometryStore } from '@/polyfills/geometry/states/workerGeometryStore';
import { createWorkerScrollStore } from '@/polyfills/scroll/utils/createWorkerScrollStore';

export const workerScrollStore = createWorkerScrollStore({
  geometryStore: workerGeometryStore,
});
