import { createSetTimeoutAnimationFrameScheduler } from '../createSetTimeoutAnimationFrameScheduler';

describe('createSetTimeoutAnimationFrameScheduler', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should run every callback queued in one tick on the same frame timestamp', () => {
    const scheduler = createSetTimeoutAnimationFrameScheduler({});
    const firstCallback = jest.fn();
    const secondCallback = jest.fn();

    scheduler.request(firstCallback);
    jest.advanceTimersByTime(8);
    scheduler.request(secondCallback);

    jest.advanceTimersByTime(8);

    expect(firstCallback).toHaveBeenCalledTimes(1);
    expect(secondCallback).toHaveBeenCalledTimes(1);
    expect(firstCallback.mock.calls[0][0]).toBe(
      secondCallback.mock.calls[0][0],
    );
  });

  it('should run a callback requested during a frame on the next frame', () => {
    const scheduler = createSetTimeoutAnimationFrameScheduler({});
    const nextFrameCallback = jest.fn();

    scheduler.request(() => {
      scheduler.request(nextFrameCallback);
    });

    jest.advanceTimersByTime(16);

    expect(nextFrameCallback).not.toHaveBeenCalled();

    jest.advanceTimersByTime(16);

    expect(nextFrameCallback).toHaveBeenCalledTimes(1);
  });

  it('should cancel a queued callback through its handle', () => {
    const scheduler = createSetTimeoutAnimationFrameScheduler({});
    const canceledCallback = jest.fn();
    const keptCallback = jest.fn();

    const canceledFrameHandle = scheduler.request(canceledCallback);
    scheduler.request(keptCallback);
    scheduler.cancel(canceledFrameHandle);

    jest.advanceTimersByTime(16);

    expect(canceledCallback).not.toHaveBeenCalled();
    expect(keptCallback).toHaveBeenCalledTimes(1);
  });

  it('should keep running the frame when a callback throws', () => {
    const dispatchEvent = jest.fn();
    const polyfillWindow = {
      ErrorEvent: class {
        defaultPrevented = true;
      },
      dispatchEvent,
    };
    const scheduler = createSetTimeoutAnimationFrameScheduler({
      window: polyfillWindow,
    });
    const laterCallback = jest.fn();

    scheduler.request(() => {
      throw new Error('callback exploded');
    });
    scheduler.request(laterCallback);

    jest.advanceTimersByTime(16);

    expect(dispatchEvent).toHaveBeenCalledTimes(1);
    expect(laterCallback).toHaveBeenCalledTimes(1);
  });
});
