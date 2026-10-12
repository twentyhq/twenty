import { type PointerEvent } from 'react';

import { type SeparatorPointerCaptureReleaseTracker } from '@/host/elements/types/SeparatorPointerCaptureReleaseTracker';

export const createSeparatorPointerCaptureReleaseTracker =
  (): SeparatorPointerCaptureReleaseTracker => {
    const pointerIdsReleasedAtGestureEndBySeparator = new WeakMap<
      Element,
      Set<number>
    >();

    const releasePointerCaptureAtGestureEnd = (
      event: PointerEvent<HTMLElement>,
    ): void => {
      const separator = event.currentTarget;

      if (!separator.hasPointerCapture(event.pointerId)) {
        return;
      }

      const pointerIdsReleasedAtGestureEnd =
        pointerIdsReleasedAtGestureEndBySeparator.get(separator) ??
        new Set<number>();

      pointerIdsReleasedAtGestureEnd.add(event.pointerId);
      pointerIdsReleasedAtGestureEndBySeparator.set(
        separator,
        pointerIdsReleasedAtGestureEnd,
      );
      separator.releasePointerCapture(event.pointerId);
    };

    const consumePointerCaptureReleasedAtGestureEnd = (
      event: PointerEvent<HTMLElement>,
    ): boolean =>
      pointerIdsReleasedAtGestureEndBySeparator
        .get(event.currentTarget)
        ?.delete(event.pointerId) ?? false;

    return {
      releasePointerCaptureAtGestureEnd,
      consumePointerCaptureReleasedAtGestureEnd,
    };
  };
