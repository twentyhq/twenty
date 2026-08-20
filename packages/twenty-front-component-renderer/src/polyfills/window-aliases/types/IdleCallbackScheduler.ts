import { type TimerHandle } from '@/polyfills/window-aliases/types/TimerHandle';

export type IdleCallbackScheduler = {
  request: (
    callback: IdleRequestCallback,
    options?: IdleRequestOptions,
  ) => TimerHandle;
  cancel: (idleCallbackHandle: TimerHandle) => void;
};
