export type GeometryObservationTransport = {
  observeElementGeometry: (remoteElementIds: string[]) => Promise<void>;
};
