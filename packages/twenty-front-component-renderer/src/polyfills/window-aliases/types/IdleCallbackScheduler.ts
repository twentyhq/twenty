import { type TimerHandle } from '@/polyfills/window-aliases/types/TimerHandle';

export type IdleCallbackScheduler = {
  requestIdleCallback: (
    callback: IdleRequestCallback,
    options?: IdleRequestOptions,
  ) => TimerHandle;
  cancelIdleCallback: (idleCallbackHandle: TimerHandle) => void;
};
