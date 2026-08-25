import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type RoutePayload } from 'twenty-sdk/define';

import { FIREFLIES_BACKFILL_WORKER_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { LOGIC_FUNCTION_EXECUTION_CONTEXT } from 'src/logic-functions/flows/__tests__/import-missing-fireflies-calls.test-support';
import firefliesBackfillLogicFunction from 'src/logic-functions/fireflies-backfill';

const enqueueJobsMock = vi.hoisted(() => vi.fn());
const listConnectionsMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-sdk/logic-function', () => ({
  enqueueJobs: enqueueJobsMock,
  listConnections: listConnectionsMock,
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
    listConnectionsMock.mockResolvedValue([
      { id: 'connection-1' },
      { id: 'connection-2' },
    ]);
    enqueueJobsMock.mockResolvedValue({ enqueued: true });
  });

  afterEach(() => {
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
      LOGIC_FUNCTION_EXECUTION_CONTEXT,
    );

    expect(result).toEqual({
      outcome: 'invalid-request',
      error: 'Fireflies backfill requires a days window between 1 and 3650',
    });
    expect(enqueueJobsMock).not.toHaveBeenCalled();
  });

  it('returns not-configured without enqueueing when no connection exists', async () => {
    listConnectionsMock.mockResolvedValue([]);

    const result = await firefliesBackfillLogicFunction.config.handler(
      buildRoutePayload({ days: 30 }),
      LOGIC_FUNCTION_EXECUTION_CONTEXT,
    );

    expect(result).toEqual({
      outcome: 'not-configured',
      error: expect.stringContaining('Fireflies is not configured'),
    });
    expect(enqueueJobsMock).not.toHaveBeenCalled();
  });

  it('enqueues discovery instead of listing transcripts in the route', async () => {
    const result = await firefliesBackfillLogicFunction.config.handler(
      buildRoutePayload({ days: 30 }),
      LOGIC_FUNCTION_EXECUTION_CONTEXT,
    );

    expect(result).toEqual({ outcome: 'started', connectionCount: 2 });
    expect(enqueueJobsMock).toHaveBeenCalledWith({
      logicFunctionUniversalIdentifier:
        FIREFLIES_BACKFILL_WORKER_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payloads: [
        { connectionId: 'connection-1', days: 30 },
        { connectionId: 'connection-2', days: 30 },
      ],
    });
  });
});
