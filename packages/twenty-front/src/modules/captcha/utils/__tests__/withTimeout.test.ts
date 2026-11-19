import { withTimeout } from '@/captcha/utils/withTimeout';

describe('withTimeout', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should resolve with the promise value when it settles in time', async () => {
    const result = withTimeout({
      promise: Promise.resolve('value'),
      timeoutInMs: 1000,
      timeoutMessage: 'timed out',
    });

    await expect(result).resolves.toBe('value');
    expect(jest.getTimerCount()).toBe(0);
  });

  it('should reject with the promise error when it fails in time', async () => {
    const result = withTimeout({
      promise: Promise.reject(new Error('failed')),
      timeoutInMs: 1000,
      timeoutMessage: 'timed out',
    });

    await expect(result).rejects.toThrow('failed');
  });

  it('should reject with the timeout message when the promise never settles', async () => {
    const result = withTimeout({
      promise: new Promise<string>(() => {}),
      timeoutInMs: 1000,
      timeoutMessage: 'timed out',
    });

    jest.advanceTimersByTime(1000);

    await expect(result).rejects.toThrow('timed out');
  });
});
