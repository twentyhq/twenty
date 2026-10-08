import { type ElementRefCallback } from '@/host/elements/types/ElementRefCallback';
import { type FindRemoteElementIdContainingNode } from '@/host/geometry/types/FindRemoteElementIdContainingNode';
import { type PushGeometryUpdates } from '@/host/geometry/types/PushGeometryUpdates';
import { type ViewportGeometrySnapshot } from '@/types/ViewportGeometrySnapshot';

export type GeometryTracker = {
  registerNode: (remoteElementId: string, node: Element) => void;
  unregisterNode: (remoteElementId: string, node: Element) => void;
  getRegisteredNode: (remoteElementId: string) => Element | undefined;
  findRemoteElementIdContainingNode: FindRemoteElementIdContainingNode;
  observe: (remoteElementIds: unknown) => void;
  unobserve: (remoteElementIds: unknown) => void;
  setRoot: ElementRefCallback;
  setPortalLayer: (element: HTMLElement | null) => void;
  setPushGeometryUpdates: (
    pushGeometryUpdates: PushGeometryUpdates | null,
  ) => void;
  getViewportGeometry: () => ViewportGeometrySnapshot;
  reset: () => void;
};
