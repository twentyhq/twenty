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
      run: async () => 'value',
      timeoutInMs: 1000,
      timeoutMessage: 'timed out',
    });

    await expect(result).resolves.toBe('value');
    expect(jest.getTimerCount()).toBe(0);
  });

  it('should reject with the promise error when it fails in time', async () => {
    const result = withTimeout({
      run: async () => {
        throw new Error('failed');
      },
      timeoutInMs: 1000,
      timeoutMessage: 'timed out',
    });

    await expect(result).rejects.toThrow('failed');
  });

  it('should reject and abort the run when it never settles', async () => {
    const handleAbort = jest.fn();

    const result = withTimeout({
      run: (abortSignal) => {
        abortSignal.addEventListener('abort', handleAbort);

        return new Promise<string>(() => {});
      },
      timeoutInMs: 1000,
      timeoutMessage: 'timed out',
    });

    jest.advanceTimersByTime(1000);

    await expect(result).rejects.toThrow('timed out');
    expect(handleAbort).toHaveBeenCalledTimes(1);
  });

  it('should not abort a run that settled in time', async () => {
    const handleAbort = jest.fn();

    await withTimeout({
      run: async (abortSignal) => {
        abortSignal.addEventListener('abort', handleAbort);

        return 'value';
      },
      timeoutInMs: 1000,
      timeoutMessage: 'timed out',
    });

    jest.advanceTimersByTime(1000);

    expect(handleAbort).not.toHaveBeenCalled();
  });
});
