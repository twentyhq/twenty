export type HostFocusController = {
  callFocusMethod: (input: {
    remoteElementId: string;
    methodName: 'focus' | 'blur';
    options?: FocusOptions;
  }) => void;
  retryPendingFocus: () => void;
  reset: () => void;
};
