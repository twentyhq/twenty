import { ANIMATION_FRAME_FALLBACK_INTERVAL_MS } from '@/polyfills/window-aliases/constants/AnimationFrameFallbackIntervalMs';
import { type AnimationFrameScheduler } from '@/polyfills/window-aliases/types/AnimationFrameScheduler';

export const createSetTimeoutAnimationFrameScheduler =
  (): AnimationFrameScheduler => ({
    requestAnimationFrame: (callback) =>
      setTimeout(
        () => callback(performance.now()),
        ANIMATION_FRAME_FALLBACK_INTERVAL_MS,
      ) as unknown as number,
    cancelAnimationFrame: (frameHandle) => {
      clearTimeout(frameHandle);
    },
  });
