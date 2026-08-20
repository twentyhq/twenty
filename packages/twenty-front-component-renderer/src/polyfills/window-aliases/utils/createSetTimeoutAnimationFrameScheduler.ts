import { isDefined } from 'twenty-shared/utils';

import { reportErrorToPolyfillWindow } from '@/polyfills/utils/reportErrorToPolyfillWindow';
import { resolvePolyfillWindow } from '@/polyfills/utils/resolvePolyfillWindow';
import { ANIMATION_FRAME_FALLBACK_INTERVAL_MS } from '@/polyfills/window-aliases/constants/AnimationFrameFallbackIntervalMs';
import { type AnimationFrameScheduler } from '@/polyfills/window-aliases/types/AnimationFrameScheduler';
import { type TimerHandle } from '@/polyfills/window-aliases/types/TimerHandle';

type PendingFrameRequest = {
  frameHandle: number;
  callback: FrameRequestCallback;
};

// Worker requestAnimationFrame is Chrome-only: Firefox and Safari need this fallback
export const createSetTimeoutAnimationFrameScheduler = (
  globalScope: Record<string, unknown>,
): AnimationFrameScheduler => {
  let nextFrameHandle = 1;
  let pendingFrameRequests: PendingFrameRequest[] = [];
  let frameTimerHandle: TimerHandle | null = null;

  const runFrame = () => {
    frameTimerHandle = null;

    // Drained before the callbacks run so a callback requesting another frame
    // lands on the next one, the way the native scheduler batches them.
    const frameRequests = pendingFrameRequests;
    pendingFrameRequests = [];

    const frameTimestamp = performance.now();

    for (const frameRequest of frameRequests) {
      try {
        frameRequest.callback(frameTimestamp);
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
      pendingFrameRequests.push({ frameHandle, callback });

      if (!isDefined(frameTimerHandle)) {
        frameTimerHandle = setTimeout(
          runFrame,
          ANIMATION_FRAME_FALLBACK_INTERVAL_MS,
        );
      }

      return frameHandle;
    },
    cancel: (frameHandle) => {
      pendingFrameRequests = pendingFrameRequests.filter(
        (pendingFrameRequest) =>
          pendingFrameRequest.frameHandle !== frameHandle,
      );
    },
  };
};
