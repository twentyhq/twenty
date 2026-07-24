import { createMicrotaskCoalescedCallback } from '../createMicrotaskCoalescedCallback';

describe('createMicrotaskCoalescedCallback', () => {
  it('should run the callback once for a burst of synchronous calls', async () => {
    const callback = jest.fn();
    const scheduleCallback = createMicrotaskCoalescedCallback(callback);

    scheduleCallback();
    scheduleCallback();
    scheduleCallback();

    expect(callback).not.toHaveBeenCalled();

    await Promise.resolve();

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should run the callback again for a call in a later microtask', async () => {
    const callback = jest.fn();
    const scheduleCallback = createMicrotaskCoalescedCallback(callback);

    scheduleCallback();
    await Promise.resolve();

    scheduleCallback();
    await Promise.resolve();

    expect(callback).toHaveBeenCalledTimes(2);
  });
});
