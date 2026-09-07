import { isFunction } from '@sniptt/guards';

import { ANIMATION_FRAME_FALLBACK_INTERVAL_MS } from '@/polyfills/window-aliases/constants/AnimationFrameFallbackIntervalMs';

// Worker requestAnimationFrame is Chrome-only: Firefox and Safari need this fallback
export const installAnimationFrameFallback = (
  globalScope: Record<string, unknown>,
): void => {
  if (isFunction(globalScope.requestAnimationFrame)) {
    return;
  }

  globalScope.requestAnimationFrame = (callback: FrameRequestCallback) =>
    setTimeout(
      () => callback(performance.now()),
      ANIMATION_FRAME_FALLBACK_INTERVAL_MS,
    );
  globalScope.cancelAnimationFrame = (
    frameHandle: ReturnType<typeof setTimeout>,
  ) => clearTimeout(frameHandle);
};
