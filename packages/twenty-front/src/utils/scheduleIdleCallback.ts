import { isDefined } from 'twenty-shared/utils';

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
