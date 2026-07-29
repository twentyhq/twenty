import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createPacedApiClient } from 'src/utils/paced-api-client';

const MAX_TOKENS = 450;
const TIME_TO_REFILL_ONE_TOKEN_MS = Math.ceil(60_000 / MAX_TOKENS);

const buildClient = () => ({
  query: vi.fn().mockResolvedValue({ ok: true }),
  mutation: vi.fn().mockResolvedValue({ ok: true }),
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(Math, 'random').mockReturnValue(0);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('createPacedApiClient', () => {
  it('forwards arguments and results', async () => {
    const client = buildClient();
    const paced = createPacedApiClient(client as never);

    await expect(paced.query({ people: {} })).resolves.toEqual({ ok: true });
    expect(client.query).toHaveBeenCalledWith({ people: {} });

    await expect(paced.mutation({ createPeople: {} })).resolves.toEqual({
      ok: true,
    });
    expect(client.mutation).toHaveBeenCalledWith({ createPeople: {} });
  });

  it('lets a full bucket through without waiting', async () => {
    const client = buildClient();
    const paced = createPacedApiClient(client as never);

    const calls = Array.from({ length: MAX_TOKENS }, () => paced.query({}));

    await Promise.all(calls);

    expect(client.query).toHaveBeenCalledTimes(MAX_TOKENS);
  });

  it('waits for the bucket to refill once it is empty', async () => {
    const client = buildClient();
    const paced = createPacedApiClient(client as never);

    await Promise.all(
      Array.from({ length: MAX_TOKENS }, () => paced.query({})),
    );
    client.query.mockClear();

    const throttled = paced.query({});

    await vi.advanceTimersByTimeAsync(0);
    expect(client.query).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(TIME_TO_REFILL_ONE_TOKEN_MS);
    await throttled;

    expect(client.query).toHaveBeenCalledTimes(1);
  });

  it('retries a throttled request instead of failing the run', async () => {
    const client = buildClient();
    client.query
      .mockRejectedValueOnce(new Error('Limit reached (500 tokens per 60000 ms)'))
      .mockResolvedValue({ ok: true });

    const paced = createPacedApiClient(client as never);
    const promise = paced.query({});

    await vi.advanceTimersByTimeAsync(2_000);

    await expect(promise).resolves.toEqual({ ok: true });
    expect(client.query).toHaveBeenCalledTimes(2);
  });
});
