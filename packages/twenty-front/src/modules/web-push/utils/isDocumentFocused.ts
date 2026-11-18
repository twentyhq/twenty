export const isDocumentFocused = (): boolean =>
  document.visibilityState === 'visible' && document.hasFocus();
