import { installAnimationFrameFallback } from '../installAnimationFrameFallback';

describe('installAnimationFrameFallback', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should leave a native requestAnimationFrame alone', () => {
    const nativeRequest = jest.fn();
    const nativeCancel = jest.fn();
    const globalScope: Record<string, unknown> = {
      requestAnimationFrame: nativeRequest,
      cancelAnimationFrame: nativeCancel,
    };

    installAnimationFrameFallback(globalScope);

    expect(globalScope.requestAnimationFrame).toBe(nativeRequest);
    expect(globalScope.cancelAnimationFrame).toBe(nativeCancel);
  });

  it('should run the callback with a timestamp after one frame interval', () => {
    const globalScope: Record<string, unknown> = {};
    const frameCallback = jest.fn();

    installAnimationFrameFallback(globalScope);

    (globalScope.requestAnimationFrame as typeof requestAnimationFrame)(
      frameCallback,
    );

    jest.advanceTimersByTime(15);

    expect(frameCallback).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);

    expect(frameCallback).toHaveBeenCalledWith(expect.any(Number));
  });

  it('should cancel a pending callback through its handle', () => {
    const globalScope: Record<string, unknown> = {};
    const frameCallback = jest.fn();

    installAnimationFrameFallback(globalScope);

    const frameHandle = (
      globalScope.requestAnimationFrame as typeof requestAnimationFrame
    )(frameCallback);

    (globalScope.cancelAnimationFrame as typeof cancelAnimationFrame)(
      frameHandle,
    );

    jest.advanceTimersByTime(16);

    expect(frameCallback).not.toHaveBeenCalled();
  });
});
