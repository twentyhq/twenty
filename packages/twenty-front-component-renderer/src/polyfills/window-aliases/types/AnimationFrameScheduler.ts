export type AnimationFrameScheduler = {
  request: (callback: FrameRequestCallback) => number;
  cancel: (frameHandle: number) => void;
};
