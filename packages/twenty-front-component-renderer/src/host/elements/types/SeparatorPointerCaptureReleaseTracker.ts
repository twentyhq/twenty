import { type PointerEvent } from 'react';

export type SeparatorPointerCaptureReleaseTracker = {
  releasePointerCaptureAtGestureEnd: (event: PointerEvent<HTMLElement>) => void;
  consumePointerCaptureReleasedAtGestureEnd: (
    event: PointerEvent<HTMLElement>,
  ) => boolean;
};
