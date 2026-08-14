export type IdleCallbackScheduler = {
  requestIdleCallback: (
    callback: IdleRequestCallback,
    options?: IdleRequestOptions,
  ) => number;
  cancelIdleCallback: (idleCallbackHandle: number) => void;
};
