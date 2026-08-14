import { installAnimationFrameWindowAliases } from '../installAnimationFrameWindowAliases';

type RequestFrame = (callback: FrameRequestCallback) => number;
type CancelFrame = (frameHandle: number) => void;

describe('installAnimationFrameWindowAliases', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('should alias the native scheduler onto a distinct window when present', () => {
    const nativeRequestAnimationFrame = jest.fn().mockReturnValue(7);
    const nativeCancelAnimationFrame = jest.fn();
    const polyfillWindow: Record<string, unknown> = {};
    const globalScope: Record<string, unknown> = {
      window: polyfillWindow,
      requestAnimationFrame: nativeRequestAnimationFrame,
      cancelAnimationFrame: nativeCancelAnimationFrame,
    };

    installAnimationFrameWindowAliases(globalScope);

    expect(globalScope.requestAnimationFrame).toBe(nativeRequestAnimationFrame);
    expect(globalScope.cancelAnimationFrame).toBe(nativeCancelAnimationFrame);

    const frameCallback = jest.fn();
    const frameHandle = (polyfillWindow.requestAnimationFrame as RequestFrame)(
      frameCallback,
    );

    expect(frameHandle).toBe(7);
    expect(nativeRequestAnimationFrame).toHaveBeenCalledWith(frameCallback);

    (polyfillWindow.cancelAnimationFrame as CancelFrame)(frameHandle);

    expect(nativeCancelAnimationFrame).toHaveBeenCalledWith(7);
  });

  it('should install a timeout fallback on every target when no native scheduler exists', () => {
    jest.useFakeTimers();

    const polyfillWindow: Record<string, unknown> = {};
    const globalScope: Record<string, unknown> = { window: polyfillWindow };

    installAnimationFrameWindowAliases(globalScope);

    expect(globalScope.requestAnimationFrame).toBe(
      polyfillWindow.requestAnimationFrame,
    );

    const firedCallback = jest.fn();

    (polyfillWindow.requestAnimationFrame as RequestFrame)(firedCallback);

    expect(firedCallback).not.toHaveBeenCalled();

    jest.advanceTimersByTime(16);

    expect(firedCallback).toHaveBeenCalledTimes(1);
    expect(firedCallback).toHaveBeenCalledWith(expect.any(Number));
  });

  it('should keep fallback frame ids cancelable through the same cancel function', () => {
    jest.useFakeTimers();

    const polyfillWindow: Record<string, unknown> = {};
    const globalScope: Record<string, unknown> = { window: polyfillWindow };

    installAnimationFrameWindowAliases(globalScope);

    const canceledCallback = jest.fn();
    const frameHandle = (polyfillWindow.requestAnimationFrame as RequestFrame)(
      canceledCallback,
    );

    (polyfillWindow.cancelAnimationFrame as CancelFrame)(frameHandle);

    jest.advanceTimersByTime(32);

    expect(canceledCallback).not.toHaveBeenCalled();
  });

  it('should replace a partial native scheduler with a coherent fallback pair', () => {
    jest.useFakeTimers();

    const nativeRequestAnimationFrame = jest.fn();
    const polyfillWindow: Record<string, unknown> = {};
    const globalScope: Record<string, unknown> = {
      window: polyfillWindow,
      requestAnimationFrame: nativeRequestAnimationFrame,
    };

    installAnimationFrameWindowAliases(globalScope);

    expect(globalScope.requestAnimationFrame).not.toBe(
      nativeRequestAnimationFrame,
    );
    expect(globalScope.requestAnimationFrame).toBe(
      polyfillWindow.requestAnimationFrame,
    );

    const canceledCallback = jest.fn();
    const frameHandle = (globalScope.requestAnimationFrame as RequestFrame)(
      canceledCallback,
    );

    (globalScope.cancelAnimationFrame as CancelFrame)(frameHandle);

    jest.advanceTimersByTime(32);

    expect(canceledCallback).not.toHaveBeenCalled();
    expect(nativeRequestAnimationFrame).not.toHaveBeenCalled();
  });
});
