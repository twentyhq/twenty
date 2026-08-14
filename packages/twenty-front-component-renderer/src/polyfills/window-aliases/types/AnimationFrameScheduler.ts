export type AnimationFrameScheduler = {
  requestAnimationFrame: (callback: FrameRequestCallback) => number;
  cancelAnimationFrame: (frameHandle: number) => void;
};
