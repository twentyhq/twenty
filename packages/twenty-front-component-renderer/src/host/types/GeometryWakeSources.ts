export type GeometryWakeSources = {
  attachViewportSources: () => boolean;
  attachElementSources: () => boolean;
  detachElementSources: () => void;
  detachAllSources: () => void;
  setRoot: (node: Element | null) => void;
  startObservingNode: (node: Element) => void;
  stopObservingNode: (node: Element) => void;
  hasAnimationInFlight: () => boolean;
  isViewportDirty: () => boolean;
  clearViewportDirty: () => void;
};
