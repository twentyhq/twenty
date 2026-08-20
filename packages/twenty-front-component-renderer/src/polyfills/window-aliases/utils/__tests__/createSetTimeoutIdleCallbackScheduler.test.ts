import { createSetTimeoutIdleCallbackScheduler } from '../createSetTimeoutIdleCallbackScheduler';

describe('createSetTimeoutIdleCallbackScheduler', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should fire the callback with an idle deadline', () => {
    const scheduler = createSetTimeoutIdleCallbackScheduler();
    const idleCallback = jest.fn();

    scheduler.request(idleCallback);

    jest.advanceTimersByTime(1);

    expect(idleCallback).toHaveBeenCalledTimes(1);

    const idleDeadline = idleCallback.mock.calls[0][0] as IdleDeadline;

    expect(idleDeadline.didTimeout).toBe(false);
    expect(idleDeadline.timeRemaining()).toBeGreaterThanOrEqual(0);
    expect(idleDeadline.timeRemaining()).toBeLessThanOrEqual(5);
  });

  it('should report didTimeout when the requested timeout is shorter than the schedule delay', () => {
    const scheduler = createSetTimeoutIdleCallbackScheduler();
    const idleCallback = jest.fn();

    scheduler.request(idleCallback, { timeout: 0 });

    jest.advanceTimersByTime(1);

    expect(idleCallback).toHaveBeenCalledTimes(1);
    expect((idleCallback.mock.calls[0][0] as IdleDeadline).didTimeout).toBe(
      true,
    );
  });

  it('should cancel a scheduled idle callback through its handle', () => {
    const scheduler = createSetTimeoutIdleCallbackScheduler();
    const canceledCallback = jest.fn();

    scheduler.cancel(scheduler.request(canceledCallback));

    jest.advanceTimersByTime(10);

    expect(canceledCallback).not.toHaveBeenCalled();
  });
});
