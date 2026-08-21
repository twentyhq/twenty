import { isDefined } from 'twenty-shared/utils';

import { ANIMATION_FRAME_FALLBACK_INTERVAL_MS } from '@/polyfills/window-aliases/constants/AnimationFrameFallbackIntervalMs';
import { type AnimationFrameScheduler } from '@/polyfills/window-aliases/types/AnimationFrameScheduler';

// Worker requestAnimationFrame is Chrome-only: Firefox and Safari need this fallback
export const createSetTimeoutAnimationFrameScheduler =
  (): AnimationFrameScheduler => {
    let nextFrameHandle = 1;
    const pendingFrameCallbacks = new Map<number, FrameRequestCallback>();
    let isFrameScheduled = false;
    let lastFrameTimestamp = performance.now();

    const runFrame = () => {
      isFrameScheduled = false;

      const frameTimestamp = performance.now();

      // Anchored before the callbacks run: a callback requesting another frame
      // measures its delay from this frame, not from when it happened to ask.
      lastFrameTimestamp = frameTimestamp;

      // Handles are snapshotted so a callback requesting another frame lands on
      // the next one, and a handle canceled mid-frame is skipped, the way the
      // native scheduler batches them.
      const frameHandles = [...pendingFrameCallbacks.keys()];

      for (const frameHandle of frameHandles) {
        const frameCallback = pendingFrameCallbacks.get(frameHandle);

        if (!isDefined(frameCallback)) {
          continue;
        }

        pendingFrameCallbacks.delete(frameHandle);

        try {
          frameCallback(frameTimestamp);
        } catch (error) {
          // Rethrown out of band so the frame keeps draining while the failure
          // still reaches the worker error event, like an uncaught native
          // callback: that is the only path the host error surface listens on.
          setTimeout(() => {
            throw error;
          });
        }
      }
    };

    const scheduleFrame = () => {
      if (isFrameScheduled) {
        return;
      }

      isFrameScheduled = true;

      setTimeout(
        runFrame,
        Math.max(
          1,
          ANIMATION_FRAME_FALLBACK_INTERVAL_MS -
            (performance.now() - lastFrameTimestamp),
        ),
      );
    };

    return {
      request: (callback) => {
        const frameHandle = nextFrameHandle;

        nextFrameHandle += 1;
        pendingFrameCallbacks.set(frameHandle, callback);

        scheduleFrame();

        return frameHandle;
      },
      cancel: (frameHandle) => {
        pendingFrameCallbacks.delete(frameHandle);
      },
    };
  };
