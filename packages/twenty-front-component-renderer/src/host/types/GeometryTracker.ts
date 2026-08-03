import { type ElementRefCallback } from '@/host/types/ElementRefCallback';
import { type PushGeometryUpdates } from '@/host/types/PushGeometryUpdates';
import { type ViewportGeometrySnapshot } from '@/types/ViewportGeometrySnapshot';

export type GeometryTracker = {
  registerNode: (remoteElementId: string, node: Element) => void;
  unregisterNode: (remoteElementId: string, node: Element) => void;
  observe: (remoteElementIds: unknown) => void;
  unobserve: (remoteElementIds: unknown) => void;
  setRoot: ElementRefCallback;
  setPushGeometryUpdates: (
    pushGeometryUpdates: PushGeometryUpdates | null,
  ) => void;
  getViewportGeometry: () => ViewportGeometrySnapshot;
  reset: () => void;
};
