import { type TimerHandle } from '@/polyfills/window-aliases/types/TimerHandle';

export type AnimationFrameScheduler = {
  requestAnimationFrame: (callback: FrameRequestCallback) => TimerHandle;
  cancelAnimationFrame: (frameHandle: TimerHandle) => void;
};
