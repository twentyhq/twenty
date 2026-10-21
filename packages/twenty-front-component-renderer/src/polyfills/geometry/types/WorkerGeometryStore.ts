import { type ElementGeometryReader } from '@/polyfills/geometry/types/ElementGeometryReader';
import { type GeometryObservationTransport } from '@/polyfills/geometry/types/GeometryObservationTransport';
import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';
import { type GeometryUpdateBatch } from '@/types/GeometryUpdateBatch';
import { type ViewportGeometrySnapshot } from '@/types/ViewportGeometrySnapshot';

export type WorkerGeometryStore = {
  setRootElement: (rootElement: object) => void;
  connectTransport: (transport: GeometryObservationTransport) => void;
  applyGeometryBatch: (batch: GeometryUpdateBatch) => void;
  getViewportSnapshot: () => ViewportGeometrySnapshot | null;
  subscribeToGeometryUpdates: (listener: () => void) => () => void;
  resolveElementSnapshot: (element: object) => ElementGeometrySnapshot | null;
  readObservedElementSnapshot: (
    element: object,
  ) => ElementGeometrySnapshot | null;
  isElementMeasured: (element: object) => boolean;
  createElementGeometryReader: (element: object) => ElementGeometryReader;
};
