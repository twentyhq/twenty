export type HostFocusController = {
  registerElement: (input: {
    remoteElementId: string;
    element: Element;
  }) => void;
  unregisterElement: (input: {
    remoteElementId: string;
    element: Element;
  }) => void;
  callFocusMethod: (input: {
    remoteElementId: string;
    methodName: 'focus' | 'blur';
    options?: FocusOptions;
  }) => void;
  retryPendingFocus: () => void;
  reset: () => void;
};
