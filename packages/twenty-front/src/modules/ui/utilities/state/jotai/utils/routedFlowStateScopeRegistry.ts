const releaseCallbacks = new Set<(scopeId: string) => void>();

export const registerRoutedFlowStateScopeRelease = (
  callback: (scopeId: string) => void,
) => {
  releaseCallbacks.add(callback);
};

export const releaseRoutedFlowStateScope = (scopeId: string) => {
  releaseCallbacks.forEach((callback) => callback(scopeId));
};
