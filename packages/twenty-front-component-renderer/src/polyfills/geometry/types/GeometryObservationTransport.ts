export type GeometryObservationTransport = {
  observeElementGeometry: (remoteElementIds: string[]) => Promise<void>;
  unobserveElementGeometry: (remoteElementIds: string[]) => Promise<void>;
};
