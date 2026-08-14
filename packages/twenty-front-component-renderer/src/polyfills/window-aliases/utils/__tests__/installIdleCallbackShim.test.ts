import { installIdleCallbackShim } from '../installIdleCallbackShim';

type RequestIdle = (callback: IdleRequestCallback) => number;
type CancelIdle = (idleCallbackHandle: number) => void;

describe('installIdleCallbackShim', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('should install the shim on both the global scope and a distinct window', () => {
    const polyfillWindow: Record<string, unknown> = {};
    const globalScope: Record<string, unknown> = { window: polyfillWindow };

    installIdleCallbackShim(globalScope);

    expect(globalScope.requestIdleCallback).toEqual(expect.any(Function));
    expect(globalScope.cancelIdleCallback).toEqual(expect.any(Function));
    expect(polyfillWindow.requestIdleCallback).toBe(
      globalScope.requestIdleCallback,
    );
    expect(polyfillWindow.cancelIdleCallback).toBe(
      globalScope.cancelIdleCallback,
    );
  });

  it('should fire the callback with an idle deadline', () => {
    jest.useFakeTimers();

    const globalScope: Record<string, unknown> = { window: {} };

    installIdleCallbackShim(globalScope);

    const idleCallback = jest.fn();

    (globalScope.requestIdleCallback as RequestIdle)(idleCallback);

    jest.advanceTimersByTime(1);

    expect(idleCallback).toHaveBeenCalledTimes(1);

    const idleDeadline = idleCallback.mock.calls[0][0] as IdleDeadline;

    expect(idleDeadline.didTimeout).toBe(false);
    expect(idleDeadline.timeRemaining()).toBeGreaterThanOrEqual(0);
    expect(idleDeadline.timeRemaining()).toBeLessThanOrEqual(50);
  });

  it('should cancel a scheduled idle callback through its handle', () => {
    jest.useFakeTimers();

    const globalScope: Record<string, unknown> = { window: {} };

    installIdleCallbackShim(globalScope);

    const canceledCallback = jest.fn();
    const idleCallbackHandle = (globalScope.requestIdleCallback as RequestIdle)(
      canceledCallback,
    );

    (globalScope.cancelIdleCallback as CancelIdle)(idleCallbackHandle);

    jest.advanceTimersByTime(10);

    expect(canceledCallback).not.toHaveBeenCalled();
  });

  it('should alias a native idle callback scheduler when present', () => {
    const nativeRequestIdleCallback = jest.fn().mockReturnValue(3);
    const nativeCancelIdleCallback = jest.fn();
    const polyfillWindow: Record<string, unknown> = {};
    const globalScope: Record<string, unknown> = {
      window: polyfillWindow,
      requestIdleCallback: nativeRequestIdleCallback,
      cancelIdleCallback: nativeCancelIdleCallback,
    };

    installIdleCallbackShim(globalScope);

    expect(globalScope.requestIdleCallback).toBe(nativeRequestIdleCallback);

    const idleCallback = jest.fn();
    const idleCallbackHandle = (
      polyfillWindow.requestIdleCallback as RequestIdle
    )(idleCallback);

    expect(idleCallbackHandle).toBe(3);
    expect(nativeRequestIdleCallback).toHaveBeenCalledWith(
      idleCallback,
      undefined,
    );

    (polyfillWindow.cancelIdleCallback as CancelIdle)(idleCallbackHandle);

    expect(nativeCancelIdleCallback).toHaveBeenCalledWith(3);
  });
});
