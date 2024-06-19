import { sleep } from '~/utils/sleep';

jest.useFakeTimers();
describe('sleep', () => {
  it('waits the provided number of milliseconds', async () => {
    const spy = jest.fn();
    const promise = sleep(1000).then(spy);

    jest.advanceTimersByTime(999);
    expect(spy).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    await promise; // let queued promises execute
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('call callback after the wait', async () => {
    const spy = jest.fn();
    let increment = 1;
    const callback = jest.fn((resolve) => {
      increment += 1;
      resolve();
    });
    const promise = sleep(1000, callback).then(spy);

    jest.advanceTimersByTime(999);
    expect(spy).not.toHaveBeenCalled();
    expect(callback).not.toHaveBeenCalled();
    expect(increment).toEqual(1);
    jest.advanceTimersByTime(1);
    await promise; // let queued promises execute
    expect(spy).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(increment).toEqual(2);
  });
});
