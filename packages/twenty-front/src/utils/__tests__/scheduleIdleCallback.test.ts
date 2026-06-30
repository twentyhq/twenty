import { scheduleIdleCallback } from '~/utils/scheduleIdleCallback';

type RequestIdleCallback = typeof window.requestIdleCallback;
type CancelIdleCallback = typeof window.cancelIdleCallback;

const setIdleCallbackApi = (
  requestIdleCallback: RequestIdleCallback | undefined,
  cancelIdleCallback: CancelIdleCallback | undefined,
) => {
  Object.defineProperty(window, 'requestIdleCallback', {
    configurable: true,
    writable: true,
    value: requestIdleCallback,
  });
  Object.defineProperty(window, 'cancelIdleCallback', {
    configurable: true,
    writable: true,
    value: cancelIdleCallback,
  });
};

describe('scheduleIdleCallback', () => {
  const originalRequestIdleCallback = window.requestIdleCallback;
  const originalCancelIdleCallback = window.cancelIdleCallback;

  afterEach(() => {
    setIdleCallbackApi(originalRequestIdleCallback, originalCancelIdleCallback);
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('when requestIdleCallback is available', () => {
    it('schedules the callback through requestIdleCallback with the timeout', () => {
      const requestIdleCallbackMock = jest.fn(() => 42);
      setIdleCallbackApi(requestIdleCallbackMock, jest.fn());

      const callback = jest.fn();
      scheduleIdleCallback(callback, { timeout: 2000 });

      expect(requestIdleCallbackMock).toHaveBeenCalledWith(callback, {
        timeout: 2000,
      });
    });

    it('cancels the scheduled callback through cancelIdleCallback', () => {
      const cancelIdleCallbackMock = jest.fn();
      setIdleCallbackApi(
        jest.fn(() => 42),
        cancelIdleCallbackMock,
      );

      const cancel = scheduleIdleCallback(jest.fn(), { timeout: 2000 });
      cancel();

      expect(cancelIdleCallbackMock).toHaveBeenCalledWith(42);
    });
  });

  describe('when requestIdleCallback is not available (e.g. Safari/iOS)', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      setIdleCallbackApi(undefined, undefined);
    });

    it('falls back to running the callback after the timeout', () => {
      const callback = jest.fn();
      scheduleIdleCallback(callback, { timeout: 2000 });

      expect(callback).not.toHaveBeenCalled();

      jest.advanceTimersByTime(2000);

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('cancels the fallback timeout before it runs', () => {
      const callback = jest.fn();
      const cancel = scheduleIdleCallback(callback, { timeout: 2000 });

      cancel();
      jest.advanceTimersByTime(2000);

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
