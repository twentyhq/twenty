import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchGraphResponse } from 'src/features/transcripts/logic-functions/utils/fetch-graph-response';

const { sleepForMillisecondsMock } = vi.hoisted(() => ({
  sleepForMillisecondsMock: vi.fn(),
}));

vi.mock(
  'src/features/transcripts/logic-functions/utils/sleep-for-milliseconds',
  () => ({ sleepForMilliseconds: sleepForMillisecondsMock }),
);

const fetchMock = vi.fn();

const buildResponse = ({
  status,
  retryAfterSeconds,
}: {
  status: number;
  retryAfterSeconds?: number;
}) =>
  new Response(status === 200 ? '{}' : null, {
    status,
    headers:
      retryAfterSeconds === undefined
        ? {}
        : { 'Retry-After': String(retryAfterSeconds) },
  });

const fetchMe = () =>
  fetchGraphResponse({
    accessToken: 'token',
    url: 'https://graph.microsoft.com/v1.0/me',
    accept: 'application/json',
  });

const getWaitsMilliseconds = () =>
  sleepForMillisecondsMock.mock.calls.map(([milliseconds]) => milliseconds);

describe('fetchGraphResponse', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sleepForMillisecondsMock.mockResolvedValue(undefined);
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should retry a throttled request after its Retry-After', async () => {
    fetchMock
      .mockResolvedValueOnce(
        buildResponse({ status: 429, retryAfterSeconds: 2 }),
      )
      .mockResolvedValueOnce(buildResponse({ status: 200 }));

    await expect(fetchMe()).resolves.toMatchObject({ status: 200 });
    expect(getWaitsMilliseconds()).toEqual([2_000]);
  });

  it('should back off exponentially and give up after the last attempt', async () => {
    fetchMock.mockImplementation(async () => buildResponse({ status: 503 }));

    await expect(fetchMe()).rejects.toMatchObject({ status: 503 });
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(getWaitsMilliseconds()).toEqual([1_000, 2_000, 4_000]);
  });

  it('should not wait on a Retry-After longer than the retry budget', async () => {
    fetchMock.mockResolvedValueOnce(
      buildResponse({ status: 429, retryAfterSeconds: 120 }),
    );

    await expect(fetchMe()).rejects.toMatchObject({ status: 429 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(sleepForMillisecondsMock).not.toHaveBeenCalled();
  });

  it('should stop retrying once the next wait would exceed the retry budget', async () => {
    fetchMock.mockImplementation(async () =>
      buildResponse({ status: 429, retryAfterSeconds: 20 }),
    );

    await expect(fetchMe()).rejects.toMatchObject({ status: 429 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(getWaitsMilliseconds()).toEqual([20_000]);
  });
});
