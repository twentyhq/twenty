export type IdleCallbackScheduler = {
  request: (
    callback: IdleRequestCallback,
    options?: IdleRequestOptions,
  ) => number;
  cancel: (idleCallbackHandle: number) => void;
};
