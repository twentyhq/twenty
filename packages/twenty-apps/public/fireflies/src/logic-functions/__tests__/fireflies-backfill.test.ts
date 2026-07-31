import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type RoutePayload } from 'twenty-sdk/define';

import firefliesBackfillLogicFunction from 'src/logic-functions/fireflies-backfill';

const fetchMock = vi.fn();

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {},
}));

const buildRoutePayload = (body: object | null): RoutePayload<unknown> => ({
  body,
  headers: {},
  queryStringParameters: {},
  pathParameters: {},
  isBase64Encoded: false,
  rawBody: undefined,
  requestContext: { http: { method: 'POST', path: '/' } },
  userWorkspaceId: null,
});

describe('firefliesBackfillLogicFunction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('FIREFLIES_API_KEY', 'fireflies-api-key');
    fetchMock.mockResolvedValue(
      new Response('invalid request', { status: 400 }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('is configured as an authenticated continuation route', () => {
    expect(firefliesBackfillLogicFunction.config).toEqual(
      expect.objectContaining({
        name: 'fireflies-backfill',
        timeoutSeconds: 900,
        httpRouteTriggerSettings: {
          path: '/fireflies/backfill',
          httpMethod: 'POST',
          isAuthRequired: true,
        },
      }),
    );
  });

  it('rejects an empty route body', async () => {
    const result = await firefliesBackfillLogicFunction.config.handler(
      buildRoutePayload(null),
    );

    expect(result).toEqual({
      outcome: 'invalid-request',
      error:
        'Fireflies backfill requires a continuation cursor or a positive days window',
    });
  });

  it('rejects an invalid continuation cursor', async () => {
    const result = await firefliesBackfillLogicFunction.config.handler(
      buildRoutePayload({
        cursor: {
          fromDate: 'not-a-date',
          toDate: '2026-07-30T00:00:00.000Z',
          skip: -1,
        },
      }),
    );

    expect(result).toEqual({
      outcome: 'invalid-request',
      error:
        'Fireflies backfill requires a continuation cursor or a positive days window',
    });
  });

  it('sweeps a window of the requested days on a fresh request', async () => {
    await firefliesBackfillLogicFunction.config.handler(
      buildRoutePayload({ days: 30 }),
    );

    const [, request] = fetchMock.mock.calls[0];
    const { variables } = JSON.parse(String((request as RequestInit).body)) as {
      variables: { fromDate: string; toDate: string; skip: number };
    };

    expect(Date.parse(variables.toDate) - Date.parse(variables.fromDate)).toBe(
      30 * 24 * 60 * 60 * 1_000,
    );
    expect(variables.skip).toBe(0);
  });

  it('continues from a raw job payload cursor', async () => {
    const continuationCursor = {
      fromDate: '2026-05-01T00:00:00.000Z',
      toDate: '2026-07-30T00:00:00.000Z',
      skip: 50,
    };

    await firefliesBackfillLogicFunction.config.handler({
      cursor: continuationCursor,
    });

    const [, request] = fetchMock.mock.calls[0];
    const { variables } = JSON.parse(String((request as RequestInit).body)) as {
      variables: { fromDate: string; toDate: string; skip: number };
    };

    expect(variables).toEqual({ ...continuationCursor, limit: 50 });
  });
});
