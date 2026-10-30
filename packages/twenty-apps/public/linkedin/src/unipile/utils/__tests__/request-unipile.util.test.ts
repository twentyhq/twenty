import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ wait: vi.fn() }));

vi.mock('src/utils/wait.util', () => ({ wait: mocks.wait }));

const { UnipileRequestError, requestUnipile } =
  await import('src/unipile/utils/request-unipile.util');

const RATE_LIMITED_ERROR = {
  status: 429,
  title: 'We only allow 10 requests. Retry in 37 seconds.',
};

describe('requestUnipile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('waits as long as Unipile asks when rate limited, then retries', async () => {
    const request = vi
      .fn()
      .mockRejectedValueOnce(RATE_LIMITED_ERROR)
      .mockResolvedValueOnce('chats');

    await expect(requestUnipile('list inbox chats', request)).resolves.toBe(
      'chats',
    );
    expect(mocks.wait).toHaveBeenCalledExactlyOnceWith(38_000);
  });

  it('hands a long rate limit back to the caller with its wait', async () => {
    const request = vi.fn().mockRejectedValue({
      status: 429,
      title: 'We only allow 100 requests. Retry in 22 hours.',
    });

    await expect(
      requestUnipile('list chat messages', request),
    ).rejects.toMatchObject({
      name: 'UnipileRateLimitError',
      retryAfterSeconds: 22 * 60 * 60 + 1,
    });
    expect(mocks.wait).not.toHaveBeenCalled();
  });

  it('gives up after 5 waits', async () => {
    const request = vi.fn().mockRejectedValue(RATE_LIMITED_ERROR);

    await expect(requestUnipile('list inbox chats', request)).rejects.toThrow(
      'Unipile list inbox chats failed (429): We only allow 10 requests. Retry in 37 seconds.',
    );
    expect(mocks.wait).toHaveBeenCalledTimes(5);
    expect(request).toHaveBeenCalledTimes(6);
  });

  it('turns the Unipile JSON error body into an error naming the request', async () => {
    const promise = requestUnipile('list inbox chats', () =>
      Promise.reject({
        status: 400,
        title: 'Invalid querystring',
        detail: 'limit must be <= 50',
      }),
    );

    await expect(promise).rejects.toThrow(
      'Unipile list inbox chats failed (400): Invalid querystring: limit must be <= 50',
    );
    await expect(promise).rejects.toBeInstanceOf(UnipileRequestError);
    await expect(promise).rejects.toMatchObject({ status: 400 });
  });

  it('rethrows network errors unchanged', async () => {
    const networkError = new TypeError('fetch failed');

    await expect(
      requestUnipile('list inboxes', () => Promise.reject(networkError)),
    ).rejects.toBe(networkError);
  });
});
