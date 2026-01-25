import { vi } from 'vitest';
import { sleep } from '~/utils/sleep';

describe('sleep', () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('waits the provided number of milliseconds', async () => {
    const spy = vi.fn();
    const promise = sleep(1000).then(spy);

    vi.advanceTimersByTime(999);
    expect(spy).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    await promise; // let queued promises execute
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('call callback after the wait', async () => {
    const spy = vi.fn();
    let increment = 1;
    const callback = vi.fn((resolve) => {
      increment += 1;
      resolve();
    });
    const promise = sleep(1000, callback).then(spy);

    vi.advanceTimersByTime(999);
    expect(spy).not.toHaveBeenCalled();
    expect(callback).not.toHaveBeenCalled();
    expect(increment).toEqual(1);
    vi.advanceTimersByTime(1);
    await promise; // let queued promises execute
    expect(spy).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(increment).toEqual(2);
  });
});
