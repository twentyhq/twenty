import { installNativeWindowAliases } from '../installNativeWindowAliases';

describe('installNativeWindowAliases', () => {
  it('should bind native scheduling functions onto a distinct window', () => {
    const receivedThisValues: unknown[] = [];
    const globalScope: Record<string, unknown> = { window: {} };
    globalScope.queueMicrotask = function (
      this: unknown,
      microtaskCallback: () => void,
    ) {
      receivedThisValues.push(this);
      microtaskCallback();
    };
    globalScope.setTimeout = jest.fn();
    globalScope.clearTimeout = jest.fn();
    globalScope.setInterval = jest.fn();
    globalScope.clearInterval = jest.fn();

    installNativeWindowAliases(globalScope);

    const polyfillWindow = globalScope.window as Record<string, unknown>;
    const microtaskCallback = jest.fn();

    (polyfillWindow.queueMicrotask as (callback: () => void) => void)(
      microtaskCallback,
    );

    expect(microtaskCallback).toHaveBeenCalledTimes(1);
    expect(receivedThisValues).toEqual([globalScope]);
    expect(polyfillWindow.setTimeout).toEqual(expect.any(Function));
    expect(polyfillWindow.clearTimeout).toEqual(expect.any(Function));
    expect(polyfillWindow.setInterval).toEqual(expect.any(Function));
    expect(polyfillWindow.clearInterval).toEqual(expect.any(Function));
  });

  it('should alias the performance object as-is', () => {
    const performanceAlias = { now: () => 42 };
    const polyfillWindow: Record<string, unknown> = {};
    const globalScope: Record<string, unknown> = {
      window: polyfillWindow,
      performance: performanceAlias,
    };

    installNativeWindowAliases(globalScope);

    expect(polyfillWindow.performance).toBe(performanceAlias);
  });

  it('should not overwrite properties a target already defines', () => {
    const existingPerformance = { now: () => 1 };
    const existingSetTimeout = jest.fn();
    const polyfillWindow: Record<string, unknown> = {
      performance: existingPerformance,
      setTimeout: existingSetTimeout,
    };
    const globalScope: Record<string, unknown> = {
      window: polyfillWindow,
      performance: { now: () => 2 },
      setTimeout: jest.fn(),
    };

    installNativeWindowAliases(globalScope);

    expect(polyfillWindow.performance).toBe(existingPerformance);
    expect(polyfillWindow.setTimeout).toBe(existingSetTimeout);
  });
});
