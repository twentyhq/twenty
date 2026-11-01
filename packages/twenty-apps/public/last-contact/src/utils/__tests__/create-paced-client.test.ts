import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createPacedClient } from 'src/utils/create-paced-client';

const MIN_CALL_INTERVAL_MS = 600;

let callTimes: number[] = [];

const buildClient = () => ({
  query: vi.fn(async (request: unknown) => {
    callTimes.push(Date.now());

    return { request };
  }),
  mutation: vi.fn(async (request: unknown) => {
    callTimes.push(Date.now());

    return { request };
  }),
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(0);
  callTimes = [];
});

afterEach(() => {
  vi.useRealTimers();
});

describe('createPacedClient', () => {
  it('forwards queries and mutations to the client', async () => {
    const pacedClient = createPacedClient(
      buildClient() as never,
      MIN_CALL_INTERVAL_MS,
    );

    await expect(pacedClient.query({ people: {} })).resolves.toEqual({
      request: { people: {} },
    });

    const mutation = pacedClient.mutation({ createPeople: {} });
    await vi.advanceTimersByTimeAsync(MIN_CALL_INTERVAL_MS);

    await expect(mutation).resolves.toEqual({
      request: { createPeople: {} },
    });
  });

  it('spaces consecutive calls by the minimum interval', async () => {
    const pacedClient = createPacedClient(
      buildClient() as never,
      MIN_CALL_INTERVAL_MS,
    );

    const calls = (async () => {
      await pacedClient.query({});
      await pacedClient.mutation({});
      await pacedClient.query({});
    })();
    await vi.advanceTimersByTimeAsync(2 * MIN_CALL_INTERVAL_MS);
    await calls;

    expect(callTimes).toEqual([0, 600, 1200]);
  });

  it('spaces concurrent calls as well', async () => {
    const pacedClient = createPacedClient(
      buildClient() as never,
      MIN_CALL_INTERVAL_MS,
    );

    const calls = Promise.all([
      pacedClient.query({}),
      pacedClient.query({}),
      pacedClient.query({}),
    ]);
    await vi.advanceTimersByTimeAsync(2 * MIN_CALL_INTERVAL_MS);
    await calls;

    expect(callTimes).toEqual([0, 600, 1200]);
  });

  it('does not wait when calls are already further apart', async () => {
    const pacedClient = createPacedClient(
      buildClient() as never,
      MIN_CALL_INTERVAL_MS,
    );

    await pacedClient.query({});
    vi.setSystemTime(5_000);
    await pacedClient.query({});

    expect(callTimes).toEqual([0, 5_000]);
  });
});
