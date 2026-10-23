export type GeometryWakeSources = {
  attachViewportSources: () => void;
  attachElementSources: () => void;
  detachElementSources: () => void;
  attachPortalLayerSources: (portalLayer: Element) => void;
  detachPortalLayerSources: () => void;
  detachAllSources: () => void;
  setRoot: (node: Element | null) => void;
  startObservingNode: (node: Element) => void;
  stopObservingNode: (node: Element) => void;
};
