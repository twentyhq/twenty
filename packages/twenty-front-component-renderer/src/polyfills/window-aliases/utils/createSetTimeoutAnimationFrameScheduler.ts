import { reportErrorToPolyfillWindow } from '@/polyfills/utils/reportErrorToPolyfillWindow';
import { resolvePolyfillWindow } from '@/polyfills/utils/resolvePolyfillWindow';
import { ANIMATION_FRAME_FALLBACK_INTERVAL_MS } from '@/polyfills/window-aliases/constants/AnimationFrameFallbackIntervalMs';
import { type AnimationFrameScheduler } from '@/polyfills/window-aliases/types/AnimationFrameScheduler';

// Worker requestAnimationFrame is Chrome-only: Firefox and Safari need this fallback
export const createSetTimeoutAnimationFrameScheduler = (
  globalScope: Record<string, unknown>,
): AnimationFrameScheduler => {
  let nextFrameHandle = 1;
  let pendingFrameCallbacks = new Map<number, FrameRequestCallback>();
  let isFrameScheduled = false;

  const runFrame = () => {
    isFrameScheduled = false;

    // Drained before the callbacks run so a callback requesting another frame
    // lands on the next one, the way the native scheduler batches them.
    const frameCallbacks = pendingFrameCallbacks;
    pendingFrameCallbacks = new Map();

    const frameTimestamp = performance.now();

    for (const frameCallback of frameCallbacks.values()) {
      try {
        frameCallback(frameTimestamp);
      } catch (error) {
        reportErrorToPolyfillWindow({
          polyfillWindow: resolvePolyfillWindow(globalScope),
          error,
        });
      }
    }
  };

  return {
    request: (callback) => {
      const frameHandle = nextFrameHandle;

      nextFrameHandle += 1;
      pendingFrameCallbacks.set(frameHandle, callback);

      if (!isFrameScheduled) {
        isFrameScheduled = true;
        setTimeout(runFrame, ANIMATION_FRAME_FALLBACK_INTERVAL_MS);
      }

      return frameHandle;
    },
    cancel: (frameHandle) => {
      pendingFrameCallbacks.delete(frameHandle);
    },
  };
};
