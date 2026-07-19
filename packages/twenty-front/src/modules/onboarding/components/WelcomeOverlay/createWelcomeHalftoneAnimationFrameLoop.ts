const FALLBACK_FRAME_INTERVAL_MS = 16;

type WelcomeHalftoneAnimationFrameLoop = {
  requestNextFrame: (onFrame: (timeMs: number) => void) => void;
  cancelPendingFrame: () => void;
};

// requestAnimationFrame is unavailable inside a dedicated worker (the primary
// rendering path), so fall back to a fixed-interval timeout there.
export const createWelcomeHalftoneAnimationFrameLoop =
  (): WelcomeHalftoneAnimationFrameLoop => {
    const supportsAnimationFrame = typeof requestAnimationFrame === 'function';
    let pendingFrameHandle = 0;

    return {
      requestNextFrame: (onFrame) => {
        pendingFrameHandle = supportsAnimationFrame
          ? requestAnimationFrame(onFrame)
          : (setTimeout(
              () => onFrame(performance.now()),
              FALLBACK_FRAME_INTERVAL_MS,
            ) as unknown as number);
      },
      cancelPendingFrame: () => {
        if (supportsAnimationFrame) {
          cancelAnimationFrame(pendingFrameHandle);
        } else {
          clearTimeout(pendingFrameHandle);
        }
      },
    };
  };
