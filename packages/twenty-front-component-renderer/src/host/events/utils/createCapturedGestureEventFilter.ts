export const createCapturedGestureEventFilter = (
  hasActivePointerCaptureForEvent: (event: object) => boolean,
): ((event: MouseEvent) => boolean) => {
  let isAwaitingReleaseCompatibilityEvents = false;

  return (event) => {
    if (hasActivePointerCaptureForEvent(event)) {
      isAwaitingReleaseCompatibilityEvents = event.type === 'pointerup';
      return true;
    }

    const isReleaseCompatibilityEvent =
      isAwaitingReleaseCompatibilityEvents &&
      (event.type === 'mouseup' || event.type === 'click');

    if (event.type === 'pointerdown' || event.type === 'click') {
      isAwaitingReleaseCompatibilityEvents = false;
    }

    return isReleaseCompatibilityEvent;
  };
};
