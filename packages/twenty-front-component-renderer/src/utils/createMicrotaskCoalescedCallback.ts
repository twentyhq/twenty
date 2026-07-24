export const createMicrotaskCoalescedCallback = (
  callback: () => void,
): (() => void) => {
  let hasCallbackScheduledForNextMicrotask = false;

  return () => {
    if (hasCallbackScheduledForNextMicrotask) {
      return;
    }

    hasCallbackScheduledForNextMicrotask = true;

    queueMicrotask(() => {
      hasCallbackScheduledForNextMicrotask = false;
      callback();
    });
  };
};
