import { type GeometryObservationTransport } from '@/polyfills/geometry/types/GeometryObservationTransport';
import { type MirroredElementState } from '@/polyfills/geometry/types/MirroredElementState';
import { type GeometryUpdateBatch } from '@/types/GeometryUpdateBatch';
import { type ViewportGeometrySnapshot } from '@/types/ViewportGeometrySnapshot';

export type WorkerGeometryStore = {
  setRootElement: (rootElement: object) => void;
  connectTransport: (transport: GeometryObservationTransport) => void;
  applyGeometryBatch: (batch: GeometryUpdateBatch) => void;
  getViewportSnapshot: () => ViewportGeometrySnapshot | null;
  resolveMirroredElementState: (element: object) => MirroredElementState;
  resolveElementByRemoteElementId: (remoteElementId: string) => object | null;
};
