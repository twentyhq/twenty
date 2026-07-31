import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type RoutePayload } from 'twenty-sdk/define';

import {
  buildListedTranscript,
  serveFirefliesApi,
} from 'src/logic-functions/flows/__tests__/import-missing-fireflies-calls.test-support';
import firefliesBackfillLogicFunction from 'src/logic-functions/fireflies-backfill';

const fetchMock = vi.fn();
const enqueueJobMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {},
}));

vi.mock('twenty-sdk/logic-function', () => ({
  enqueueJob: enqueueJobMock,
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
    fetchMock.mockImplementation(
      async () => new Response('invalid request', { status: 400 }),
    );
    enqueueJobMock.mockResolvedValue({ enqueued: true });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('is configured as an authenticated backfill route', () => {
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
      error: 'Fireflies backfill requires a days window between 1 and 3650',
    });
    expect(enqueueJobMock).not.toHaveBeenCalled();
  });

  it('lists a window of the requested days', async () => {
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

  it('enqueues one job per batch of listed transcript ids', async () => {
    const transcripts = Array.from({ length: 25 }, (_, callIndex) =>
      buildListedTranscript(
        `call-${callIndex}`,
        Date.parse('2026-06-02T10:00:00.000Z'),
      ),
    );

    serveFirefliesApi([transcripts], fetchMock);

    const result = await firefliesBackfillLogicFunction.config.handler(
      buildRoutePayload({ days: 30 }),
    );

    expect(result).toEqual(
      expect.objectContaining({
        outcome: 'started',
        transcriptCount: 25,
        batchCount: 2,
      }),
    );
    expect(enqueueJobMock).toHaveBeenCalledTimes(2);
    expect(enqueueJobMock.mock.calls[0][0].payload.transcriptIds).toHaveLength(
      20,
    );
    expect(enqueueJobMock.mock.calls[1][0].payload.transcriptIds).toHaveLength(
      5,
    );
  });

  it('starts with no batches when the window has no transcripts', async () => {
    serveFirefliesApi([[]], fetchMock);

    const result = await firefliesBackfillLogicFunction.config.handler(
      buildRoutePayload({ days: 30 }),
    );

    expect(result).toEqual(
      expect.objectContaining({
        outcome: 'started',
        transcriptCount: 0,
        batchCount: 0,
      }),
    );
    expect(enqueueJobMock).not.toHaveBeenCalled();
  });

  it('reports a Fireflies listing failure without enqueueing', async () => {
    const result = await firefliesBackfillLogicFunction.config.handler(
      buildRoutePayload({ days: 30 }),
    );

    expect(result).toEqual(expect.objectContaining({ outcome: 'list-failed' }));
    expect(enqueueJobMock).not.toHaveBeenCalled();
  });

  it('reports a missing Fireflies api key', async () => {
    vi.stubEnv('FIREFLIES_API_KEY', '');

    const result = await firefliesBackfillLogicFunction.config.handler(
      buildRoutePayload({ days: 30 }),
    );

    expect(result).toEqual(
      expect.objectContaining({ outcome: 'not-configured' }),
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
