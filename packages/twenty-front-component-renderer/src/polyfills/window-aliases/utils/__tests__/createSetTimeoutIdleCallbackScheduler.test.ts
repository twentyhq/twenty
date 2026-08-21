import { createSetTimeoutIdleCallbackScheduler } from '../createSetTimeoutIdleCallbackScheduler';

describe('createSetTimeoutIdleCallbackScheduler', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('should fire the callback with an idle deadline', () => {
    const scheduler = createSetTimeoutIdleCallbackScheduler();
    const idleCallback = jest.fn();

    scheduler.request(idleCallback);

    jest.advanceTimersByTime(16);

    expect(idleCallback).toHaveBeenCalledTimes(1);

    const idleDeadline = idleCallback.mock.calls[0][0] as IdleDeadline;

    expect(idleDeadline.didTimeout).toBe(false);
    expect(idleDeadline.timeRemaining()).toBe(5);
  });

  it('should let the deadline budget run down as time passes', () => {
    const scheduler = createSetTimeoutIdleCallbackScheduler();
    const idleCallback = jest.fn();

    scheduler.request(idleCallback);

    jest.advanceTimersByTime(16);

    const idleDeadline = idleCallback.mock.calls[0][0] as IdleDeadline;

    jest.advanceTimersByTime(3);

    expect(idleDeadline.timeRemaining()).toBe(2);

    jest.advanceTimersByTime(10);

    expect(idleDeadline.timeRemaining()).toBe(0);
  });

  it('should treat a timeout of zero as no timeout, like the spec', () => {
    const scheduler = createSetTimeoutIdleCallbackScheduler();
    const idleCallback = jest.fn();

    scheduler.request(idleCallback, { timeout: 0 });

    jest.advanceTimersByTime(16);

    const idleDeadline = idleCallback.mock.calls[0][0] as IdleDeadline;

    expect(idleDeadline.didTimeout).toBe(false);
    expect(idleDeadline.timeRemaining()).toBeGreaterThan(0);
  });

  it('should treat a negative or NaN timeout as no timeout', () => {
    const scheduler = createSetTimeoutIdleCallbackScheduler();
    const negativeTimeoutCallback = jest.fn();
    const notANumberTimeoutCallback = jest.fn();

    scheduler.request(negativeTimeoutCallback, { timeout: -1 });
    scheduler.request(notANumberTimeoutCallback, { timeout: Number.NaN });

    jest.advanceTimersByTime(16);

    expect(
      (negativeTimeoutCallback.mock.calls[0][0] as IdleDeadline).didTimeout,
    ).toBe(false);
    expect(
      (notANumberTimeoutCallback.mock.calls[0][0] as IdleDeadline).didTimeout,
    ).toBe(false);
  });

  it('should report didTimeout with no budget left when the timeout elapses', () => {
    const scheduler = createSetTimeoutIdleCallbackScheduler();
    const idleCallback = jest.fn();

    scheduler.request(idleCallback, { timeout: 1 });

    jest.advanceTimersByTime(1);

    expect(idleCallback).toHaveBeenCalledTimes(1);

    const idleDeadline = idleCallback.mock.calls[0][0] as IdleDeadline;

    expect(idleDeadline.didTimeout).toBe(true);
    expect(idleDeadline.timeRemaining()).toBe(0);
  });

  it('should not report didTimeout when the callback runs within its timeout', () => {
    const scheduler = createSetTimeoutIdleCallbackScheduler();
    const idleCallback = jest.fn();

    scheduler.request(idleCallback, { timeout: 500 });

    jest.advanceTimersByTime(16);

    const idleDeadline = idleCallback.mock.calls[0][0] as IdleDeadline;

    expect(idleDeadline.didTimeout).toBe(false);
    expect(idleDeadline.timeRemaining()).toBeGreaterThan(0);
  });

  it('should report didTimeout when a busy worker delays the callback past its timeout', () => {
    const scheduler = createSetTimeoutIdleCallbackScheduler();
    const idleCallback = jest.fn();

    jest.spyOn(performance, 'now').mockReturnValueOnce(0).mockReturnValue(2000);

    scheduler.request(idleCallback, { timeout: 500 });

    jest.advanceTimersByTime(16);

    const idleDeadline = idleCallback.mock.calls[0][0] as IdleDeadline;

    expect(idleDeadline.didTimeout).toBe(true);
    expect(idleDeadline.timeRemaining()).toBe(0);
  });

  it('should cancel a scheduled idle callback through its handle', () => {
    const scheduler = createSetTimeoutIdleCallbackScheduler();
    const canceledCallback = jest.fn();

    scheduler.cancel(scheduler.request(canceledCallback));

    jest.advanceTimersByTime(20);

    expect(canceledCallback).not.toHaveBeenCalled();
  });

  it('should not clear a timer it did not schedule', () => {
    const scheduler = createSetTimeoutIdleCallbackScheduler();
    const unrelatedCallback = jest.fn();

    const unrelatedTimeout = setTimeout(unrelatedCallback, 5);

    scheduler.cancel(unrelatedTimeout as unknown as number);
    scheduler.cancel(9999);

    jest.advanceTimersByTime(10);

    expect(unrelatedCallback).toHaveBeenCalledTimes(1);
  });
});
