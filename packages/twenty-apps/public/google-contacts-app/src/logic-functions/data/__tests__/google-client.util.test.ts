import { AxiosError, type AxiosResponse } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GoogleAuthFailedError } from 'src/logic-functions/data/google-auth-failed.error';
import {
  callGoogle,
  callGoogleWithoutRetry,
} from 'src/logic-functions/data/google-client.util';

const buildGoogleError = (
  status: number,
  headers: Record<string, string> = {},
): AxiosError =>
  new AxiosError('Request failed', undefined, undefined, undefined, {
    status,
    headers,
  } as AxiosResponse);

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(Math, 'random').mockReturnValue(0);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('callGoogle', () => {
  it('should retry a server error until it succeeds', async () => {
    const request = vi
      .fn()
      .mockRejectedValueOnce(buildGoogleError(500))
      .mockResolvedValue('ok');

    const promise = callGoogle(request);
    await vi.advanceTimersByTimeAsync(2_000);

    await expect(promise).resolves.toBe('ok');
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('should wait for the Retry-After delay Google asked for', async () => {
    const request = vi
      .fn()
      .mockRejectedValueOnce(buildGoogleError(429, { 'retry-after': '10' }))
      .mockResolvedValue('ok');

    const promise = callGoogle(request);

    await vi.advanceTimersByTimeAsync(5_000);
    expect(request).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(5_000);
    await expect(promise).resolves.toBe('ok');
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('should retry a request that never got a response', async () => {
    const request = vi
      .fn()
      .mockRejectedValueOnce(new AxiosError('timeout of 30000ms exceeded'))
      .mockResolvedValue('ok');

    const promise = callGoogle(request);
    await vi.advanceTimersByTimeAsync(2_000);

    await expect(promise).resolves.toBe('ok');
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('should not retry a client error', async () => {
    const request = vi.fn().mockRejectedValue(buildGoogleError(400));

    await expect(callGoogle(request)).rejects.toBeInstanceOf(AxiosError);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('should report an unauthorized response as an auth failure without retrying', async () => {
    const request = vi.fn().mockRejectedValue(buildGoogleError(401));

    await expect(callGoogle(request)).rejects.toBeInstanceOf(
      GoogleAuthFailedError,
    );
    expect(request).toHaveBeenCalledTimes(1);
  });
});

describe('callGoogleWithoutRetry', () => {
  it('should not retry a server error', async () => {
    const request = vi.fn().mockRejectedValue(buildGoogleError(503));

    await expect(callGoogleWithoutRetry(request)).rejects.toBeInstanceOf(
      AxiosError,
    );
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('should still report an unauthorized response as an auth failure', async () => {
    const request = vi.fn().mockRejectedValue(buildGoogleError(403));

    await expect(callGoogleWithoutRetry(request)).rejects.toBeInstanceOf(
      GoogleAuthFailedError,
    );
  });
});
