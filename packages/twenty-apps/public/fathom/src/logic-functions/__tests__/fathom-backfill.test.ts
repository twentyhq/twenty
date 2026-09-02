import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildLogicFunctionExecutionContext } from 'src/__tests__/utils/logic-function-execution-context.util';
import { FATHOM_BACKFILL_WORKER_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const sdkMocks = vi.hoisted(() => ({
  enqueueJob: vi.fn(),
  listConnections: vi.fn(),
}));

vi.mock('twenty-sdk/define', () => ({
  defineLogicFunction: (config: unknown) => config,
}));

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<typeof import('twenty-sdk/logic-function')>()),
  enqueueJob: sdkMocks.enqueueJob,
  listConnections: sdkMocks.listConnections,
}));

const { fathomBackfillHandler } =
  await import('src/logic-functions/fathom-backfill');

const USER_CONTEXT = buildLogicFunctionExecutionContext('user-workspace-1');

const buildRoutePayload = (body: { days?: unknown } | null) => ({
  headers: {},
  queryStringParameters: {},
  pathParameters: {},
  body,
  isBase64Encoded: false,
  requestContext: { http: { method: 'POST', path: '/fathom/backfill' } },
  userWorkspaceId: USER_CONTEXT.userWorkspaceId,
});

const USER_CONNECTION = {
  id: 'connection-1',
  visibility: 'user',
  userWorkspaceId: 'user-workspace-1',
  accessToken: 'token',
};

describe('fathomBackfillHandler', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    sdkMocks.listConnections.mockResolvedValue([USER_CONNECTION]);
    sdkMocks.enqueueJob.mockResolvedValue({ enqueued: true });
  });

  it.each([undefined, 0, 4_000, 1.5, '30'])(
    'rejects a days window of %s without touching the queue',
    async (days) => {
      expect(
        await fathomBackfillHandler(buildRoutePayload({ days }), USER_CONTEXT),
      ).toEqual({
        success: false,
        error: expect.stringContaining('between 1 and 3650'),
      });
      expect(sdkMocks.enqueueJob).not.toHaveBeenCalled();
    },
  );

  it("starts the worker through the requesting user's connection", async () => {
    sdkMocks.listConnections.mockResolvedValue([
      { ...USER_CONNECTION, id: 'other', userWorkspaceId: 'someone-else' },
      USER_CONNECTION,
    ]);

    expect(
      await fathomBackfillHandler(
        buildRoutePayload({ days: 30 }),
        USER_CONTEXT,
      ),
    ).toEqual({ success: true, connectedAccountId: 'connection-1', days: 30 });
    expect(sdkMocks.enqueueJob).toHaveBeenCalledWith({
      logicFunctionUniversalIdentifier:
        FATHOM_BACKFILL_WORKER_UNIVERSAL_IDENTIFIER,
      payload: { connectedAccountId: 'connection-1', days: 30 },
      retryLimit: 3,
    });
  });

  it('reports a missing connection for the requesting user', async () => {
    sdkMocks.listConnections.mockResolvedValue([
      { ...USER_CONNECTION, userWorkspaceId: 'someone-else' },
    ]);

    expect(
      await fathomBackfillHandler(
        buildRoutePayload({ days: 30 }),
        USER_CONTEXT,
      ),
    ).toEqual({
      success: false,
      error: expect.stringContaining('not connected'),
    });
    expect(sdkMocks.enqueueJob).not.toHaveBeenCalled();
  });

  it('does not report a started import when the queue rejects it', async () => {
    sdkMocks.enqueueJob.mockResolvedValue({ enqueued: false });

    await expect(
      fathomBackfillHandler(buildRoutePayload({ days: 30 }), USER_CONTEXT),
    ).rejects.toThrow('Failed to enqueue Fathom job');
  });
});
