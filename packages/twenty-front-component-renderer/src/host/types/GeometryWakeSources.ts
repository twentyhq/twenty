export type GeometryWakeSources = {
  attachViewportSources: () => void;
  attachElementSources: () => void;
  detachElementSources: () => void;
  detachAllSources: () => void;
  setRoot: (node: Element | null) => void;
  startObservingNode: (node: Element) => void;
  stopObservingNode: (node: Element) => void;
  hasAnimationInFlight: () => boolean;
  isViewportDirty: () => boolean;
  clearViewportDirty: () => void;
};
