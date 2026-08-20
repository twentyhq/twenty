import { installAnimationFrameWindowAliases } from '../installAnimationFrameWindowAliases';

type RequestFrame = (callback: FrameRequestCallback) => number;
type CancelFrame = (frameHandle: number) => void;

describe('installSchedulerPairAliases', () => {
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

  it('should install a fallback on every target when no native scheduler exists', () => {
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

  it('should keep a native scheduler that is missing its cancel function', () => {
    const nativeRequestAnimationFrame = jest.fn();
    const polyfillWindow: Record<string, unknown> = {};
    const globalScope: Record<string, unknown> = {
      window: polyfillWindow,
      requestAnimationFrame: nativeRequestAnimationFrame,
    };

    installAnimationFrameWindowAliases(globalScope);

    expect(globalScope.requestAnimationFrame).toBe(nativeRequestAnimationFrame);
    expect(globalScope.cancelAnimationFrame).toBeUndefined();
    expect(polyfillWindow.requestAnimationFrame).toEqual(expect.any(Function));
    expect(polyfillWindow.cancelAnimationFrame).toEqual(expect.any(Function));
  });

  it('should not overwrite a target that already holds the whole pair', () => {
    const existingRequestAnimationFrame = jest.fn();
    const existingCancelAnimationFrame = jest.fn();
    const polyfillWindow: Record<string, unknown> = {
      requestAnimationFrame: existingRequestAnimationFrame,
      cancelAnimationFrame: existingCancelAnimationFrame,
    };
    const globalScope: Record<string, unknown> = { window: polyfillWindow };

    installAnimationFrameWindowAliases(globalScope);

    expect(polyfillWindow.requestAnimationFrame).toBe(
      existingRequestAnimationFrame,
    );
    expect(polyfillWindow.cancelAnimationFrame).toBe(
      existingCancelAnimationFrame,
    );
  });
});
