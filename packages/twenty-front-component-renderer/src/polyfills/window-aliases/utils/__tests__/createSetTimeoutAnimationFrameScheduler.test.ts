import { createSetTimeoutAnimationFrameScheduler } from '../createSetTimeoutAnimationFrameScheduler';

describe('createSetTimeoutAnimationFrameScheduler', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should run every callback queued in one tick on the same frame timestamp', () => {
    const scheduler = createSetTimeoutAnimationFrameScheduler();
    const firstCallback = jest.fn();
    const secondCallback = jest.fn();

    scheduler.request(firstCallback);
    jest.advanceTimersByTime(8);
    scheduler.request(secondCallback);

    jest.advanceTimersByTime(8);

    expect(firstCallback).toHaveBeenCalledTimes(1);
    expect(secondCallback).toHaveBeenCalledTimes(1);
    expect(firstCallback).toHaveBeenCalledWith(performance.now());
    expect(secondCallback).toHaveBeenCalledWith(performance.now());
  });

  it('should run a callback requested during a frame on the next frame', () => {
    const scheduler = createSetTimeoutAnimationFrameScheduler();
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
    const scheduler = createSetTimeoutAnimationFrameScheduler();
    const canceledCallback = jest.fn();
    const keptCallback = jest.fn();

    const canceledFrameHandle = scheduler.request(canceledCallback);
    scheduler.request(keptCallback);
    scheduler.cancel(canceledFrameHandle);

    jest.advanceTimersByTime(16);

    expect(canceledCallback).not.toHaveBeenCalled();
    expect(keptCallback).toHaveBeenCalledTimes(1);
  });

  it('should skip a callback canceled by an earlier callback of the same frame', () => {
    const scheduler = createSetTimeoutAnimationFrameScheduler();
    const canceledCallback = jest.fn();

    scheduler.request(() => {
      scheduler.cancel(canceledFrameHandle);
    });
    const canceledFrameHandle = scheduler.request(canceledCallback);

    jest.advanceTimersByTime(16);

    expect(canceledCallback).not.toHaveBeenCalled();
  });

  it('should keep running the frame when a callback throws, and surface the error', () => {
    const scheduler = createSetTimeoutAnimationFrameScheduler();
    const laterCallback = jest.fn();

    scheduler.request(() => {
      throw new Error('callback exploded');
    });
    scheduler.request(laterCallback);

    jest.advanceTimersByTime(16);

    expect(laterCallback).toHaveBeenCalledTimes(1);
    // Rethrown out of band, so it surfaces on the next macrotask rather than
    // interrupting the frame that produced it.
    expect(() => jest.advanceTimersByTime(1)).toThrow('callback exploded');
  });

  it('should anchor the next frame to the current one rather than to the callback', () => {
    const scheduler = createSetTimeoutAnimationFrameScheduler();
    const nextFrameCallback = jest.fn();
    const frameStartTimestamp = performance.now() + 16;

    scheduler.request(() => {
      jest
        .spyOn(performance, 'now')
        .mockReturnValueOnce(frameStartTimestamp + 6);

      scheduler.request(nextFrameCallback);
    });

    jest.advanceTimersByTime(16);
    jest.advanceTimersByTime(10);

    expect(nextFrameCallback).toHaveBeenCalledTimes(1);
  });
});
