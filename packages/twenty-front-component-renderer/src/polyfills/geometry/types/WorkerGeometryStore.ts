import { type GeometryObservationTransport } from '@/polyfills/geometry/types/GeometryObservationTransport';
import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';
import { type GeometryUpdateBatch } from '@/types/GeometryUpdateBatch';
import { type ViewportGeometrySnapshot } from '@/types/ViewportGeometrySnapshot';

export type WorkerGeometryStore = {
  setRootElement: (rootElement: object) => void;
  connectTransport: (transport: GeometryObservationTransport) => void;
  applyGeometryBatch: (batch: GeometryUpdateBatch) => void;
  getViewportSnapshot: () => ViewportGeometrySnapshot | null;
  resolveElementSnapshot: (element: object) => ElementGeometrySnapshot | null;
  resolveElementByRemoteElementId: (remoteElementId: string) => object | null;
  isElementMirrored: (element: object) => boolean;
};
