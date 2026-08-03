import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type RoutePayload } from 'twenty-sdk/define';

import { FIREFLIES_BACKFILL_WORKER_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import firefliesBackfillLogicFunction from 'src/logic-functions/fireflies-backfill';

const enqueueJobMock = vi.hoisted(() => vi.fn());

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
    enqueueJobMock.mockResolvedValue({ enqueued: true });
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

  it('enqueues discovery instead of listing transcripts in the route', async () => {
    const result = await firefliesBackfillLogicFunction.config.handler(
      buildRoutePayload({ days: 30 }),
    );

    expect(result).toEqual({ outcome: 'started' });
    expect(enqueueJobMock).toHaveBeenCalledWith({
      logicFunctionUniversalIdentifier:
        FIREFLIES_BACKFILL_WORKER_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payload: { days: 30 },
    });
  });
});
