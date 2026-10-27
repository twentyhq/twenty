export const createCapturedGestureEventFilter = (
  hasActivePointerCaptureForEvent: (event: object) => boolean,
): ((event: MouseEvent) => boolean) => {
  let isAwaitingReleaseCompatibilityEvents = false;

  return (event) => {
    if (event.type === 'pointerdown') {
      isAwaitingReleaseCompatibilityEvents = false;
    }

    if (hasActivePointerCaptureForEvent(event)) {
      isAwaitingReleaseCompatibilityEvents = event.type === 'pointerup';
      return true;
    }

    if (
      !isAwaitingReleaseCompatibilityEvents ||
      (event.type !== 'mouseup' && event.type !== 'click')
    ) {
      return false;
    }

    if (event.type === 'click') {
      isAwaitingReleaseCompatibilityEvents = false;
    }

    return true;
  };
};
