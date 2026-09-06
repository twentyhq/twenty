import { ErrorCode } from '@slack/web-api';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { retrySlackCallWhenRateLimited } from 'src/logic-functions/utils/retry-slack-call-when-rate-limited';

const buildRateLimitedError = (retryAfter: number): Error => {
  const error = new Error(`rate limited, retry in ${retryAfter} seconds`);

  Object.assign(error, { code: ErrorCode.RateLimitedError, retryAfter });

  return error;
};

describe('retrySlackCallWhenRateLimited', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return the result without retrying when the call succeeds', async () => {
    const call = vi.fn().mockResolvedValue({ ts: '1700000000.000100' });

    const result = await retrySlackCallWhenRateLimited(call);

    expect(result).toEqual({ ts: '1700000000.000100' });
    expect(call).toHaveBeenCalledTimes(1);
  });

  it('should wait out a short Retry-After and retry once', async () => {
    vi.useFakeTimers();

    const call = vi
      .fn()
      .mockRejectedValueOnce(buildRateLimitedError(2))
      .mockResolvedValue({ ts: '1700000000.000100' });

    const resultPromise = retrySlackCallWhenRateLimited(call);

    await vi.advanceTimersByTimeAsync(2000);

    expect(await resultPromise).toEqual({ ts: '1700000000.000100' });
    expect(call).toHaveBeenCalledTimes(2);
  });

  it('should rethrow when Retry-After is longer than the wait budget', async () => {
    const call = vi.fn().mockRejectedValue(buildRateLimitedError(60));

    await expect(retrySlackCallWhenRateLimited(call)).rejects.toThrow(
      'rate limited, retry in 60 seconds',
    );
    expect(call).toHaveBeenCalledTimes(1);
  });

  it('should rethrow the second rate limit instead of retrying forever', async () => {
    vi.useFakeTimers();

    const call = vi.fn().mockRejectedValue(buildRateLimitedError(1));

    const resultPromise = retrySlackCallWhenRateLimited(call);
    const assertion = expect(resultPromise).rejects.toThrow(
      'rate limited, retry in 1 seconds',
    );

    await vi.advanceTimersByTimeAsync(1000);
    await assertion;

    expect(call).toHaveBeenCalledTimes(2);
  });

  it('should not retry an error that is not a rate limit', async () => {
    const call = vi.fn().mockRejectedValue(new Error('channel_not_found'));

    await expect(retrySlackCallWhenRateLimited(call)).rejects.toThrow(
      'channel_not_found',
    );
    expect(call).toHaveBeenCalledTimes(1);
  });
});
