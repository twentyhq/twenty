export type WorkerFocusMethodRequest = {
  element: object;
  methodName: 'focus' | 'blur';
  options?: FocusOptions;
};
