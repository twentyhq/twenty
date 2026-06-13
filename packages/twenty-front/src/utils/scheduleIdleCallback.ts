import { isDefined } from 'twenty-shared/utils';

// Runs `callback` during a browser idle period so non-critical work (e.g.
// loading a third-party widget) does not compete with rendering and data
// fetching during boot. `timeout` is the maximum delay before it runs: with
// requestIdleCallback the callback fires at the first idle gap but no later
// than the timeout; on browsers that lack it (Safari/iOS, where it is
// disabled by default) we fall back to a plain setTimeout of that duration.
// Returns a function that cancels the scheduled callback.
export const scheduleIdleCallback = (
  callback: () => void,
  { timeout }: { timeout: number },
): (() => void) => {
  const requestIdleCallbackFn: typeof window.requestIdleCallback | undefined =
    window.requestIdleCallback;

  if (isDefined(requestIdleCallbackFn)) {
    const handle = requestIdleCallbackFn(callback, { timeout });

    return () => window.cancelIdleCallback(handle);
  }

  const handle = window.setTimeout(callback, timeout);

  return () => window.clearTimeout(handle);
};
