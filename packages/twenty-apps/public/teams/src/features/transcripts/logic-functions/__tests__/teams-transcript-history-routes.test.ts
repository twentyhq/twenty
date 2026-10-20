import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/transcripts/constants/transcripts-enabled-application-variable-key';
import { teamsTranscriptHistoryCountHandler } from 'src/features/transcripts/logic-functions/teams-transcript-history-count';
import { teamsTranscriptHistoryImportHandler } from 'src/features/transcripts/logic-functions/teams-transcript-history-import';
import { teamsTranscriptHistoryStatusHandler } from 'src/features/transcripts/logic-functions/teams-transcript-history-status';

const { releaseFlags, kvStore, listConnectionsMock, enqueueJobsMock } =
  vi.hoisted(() => ({
    releaseFlags: {
      IS_TRANSCRIPT_HISTORY_IMPORT_RELEASED: true,
    },
    kvStore: new Map<string, unknown>(),
    listConnectionsMock: vi.fn(),
    enqueueJobsMock: vi.fn(),
  }));

vi.mock('src/constants/release-flags', () => ({
  RELEASE_FLAGS: releaseFlags,
}));

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  kv: {
    get: async (key: string) => kvStore.get(key) ?? null,
    set: async (key: string, value: unknown) => {
      kvStore.set(key, value);
    },
  },
  listConnections: listConnectionsMock,
  enqueueJobs: enqueueJobsMock,
}));

const STATE_KV_KEY = 'teams-transcript-history:admin-connection';

const OWNER_CONTEXT = { userWorkspaceId: 'admin' };

const ADMIN_CONNECTION = {
  id: 'admin-connection',
  providerName: 'microsoft-teams',
  name: 'Admin',
  handle: 'admin@acme.com',
  visibility: 'workspace' as const,
  userWorkspaceId: 'admin',
  workspaceMemberId: null,
  accessToken: 'token',
  scopes: [],
  authFailedAt: null,
  authFailedReason: null,
};

const buildRoutePayload = <TBody>(body: TBody) => ({
  headers: {},
  queryStringParameters: {},
  pathParameters: {},
  body,
  isBase64Encoded: false,
  requestContext: { http: { method: 'POST', path: '/' } },
  userWorkspaceId: null,
});

const COUNTED_STATE = {
  runId: 'counted-run',
  days: 90,
  windowStart: '2026-06-17T00:00:00.000Z',
  windowEnd: '2026-09-15T00:00:00.000Z',
  phase: 'counted',
  transcriptCount: 8,
  alreadyImportedCount: 2,
  deletedCount: 1,
  pageCount: 3,
  importedCount: 0,
  skippedCount: 0,
  unavailableCount: 0,
  updatedAt: '2026-09-15T00:05:00.000Z',
};

describe('Teams transcript history routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    kvStore.clear();
    releaseFlags.IS_TRANSCRIPT_HISTORY_IMPORT_RELEASED = true;
    process.env[TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY] = 'true';
    listConnectionsMock.mockResolvedValue([ADMIN_CONNECTION]);
    enqueueJobsMock.mockResolvedValue(undefined);
  });

  it('should refuse every history route until history import is released', async () => {
    releaseFlags.IS_TRANSCRIPT_HISTORY_IMPORT_RELEASED = false;

    await expect(
      teamsTranscriptHistoryCountHandler(
        buildRoutePayload({ days: 30 }),
        OWNER_CONTEXT,
      ),
    ).resolves.toEqual({
      success: false,
      errorCode: 'transcripts-not-enabled',
    });
    await expect(
      teamsTranscriptHistoryImportHandler(
        buildRoutePayload({ runId: 'counted-run' }),
        OWNER_CONTEXT,
      ),
    ).resolves.toEqual({
      success: false,
      errorCode: 'transcripts-not-enabled',
    });
    await expect(
      teamsTranscriptHistoryStatusHandler(
        buildRoutePayload(null),
        OWNER_CONTEXT,
      ),
    ).resolves.toEqual({
      success: false,
      errorCode: 'transcripts-not-enabled',
    });
    expect(enqueueJobsMock).not.toHaveBeenCalled();
  });

  it.each([0, 366, 1.5, '30', undefined])(
    'should refuse to count %s days',
    async (days) => {
      await expect(
        teamsTranscriptHistoryCountHandler(
          buildRoutePayload({ days }),
          OWNER_CONTEXT,
        ),
      ).resolves.toEqual({ success: false, errorCode: 'invalid-days' });
      expect(enqueueJobsMock).not.toHaveBeenCalled();
    },
  );

  it('should count on the connection the member added', async () => {
    await expect(
      teamsTranscriptHistoryCountHandler(
        buildRoutePayload({ days: 90 }),
        OWNER_CONTEXT,
      ),
    ).resolves.toMatchObject({
      success: true,
      state: { phase: 'counting', days: 90 },
    });
    expect(enqueueJobsMock).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['a member who did not add the shared connection', 'member'],
    ['a request without a user', null],
  ])(
    'should not let %s use the shared connection',
    async (_, userWorkspaceId) => {
      await expect(
        teamsTranscriptHistoryCountHandler(buildRoutePayload({ days: 90 }), {
          userWorkspaceId,
        }),
      ).resolves.toEqual({ success: false, errorCode: 'not-connected' });
      await expect(
        teamsTranscriptHistoryImportHandler(
          buildRoutePayload({ runId: 'counted-run' }),
          { userWorkspaceId },
        ),
      ).resolves.toEqual({ success: false, errorCode: 'not-connected' });
      expect(enqueueJobsMock).not.toHaveBeenCalled();
    },
  );

  it('should refuse a count while another run is active and accept one once it stalled', async () => {
    kvStore.set(STATE_KV_KEY, {
      ...COUNTED_STATE,
      phase: 'importing',
      updatedAt: new Date().toISOString(),
    });

    await expect(
      teamsTranscriptHistoryCountHandler(
        buildRoutePayload({ days: 90 }),
        OWNER_CONTEXT,
      ),
    ).resolves.toEqual({ success: false, errorCode: 'run-already-active' });

    kvStore.set(STATE_KV_KEY, {
      ...COUNTED_STATE,
      phase: 'importing',
      updatedAt: new Date(Date.now() - 41 * 60 * 1_000).toISOString(),
    });

    await expect(
      teamsTranscriptHistoryCountHandler(
        buildRoutePayload({ days: 90 }),
        OWNER_CONTEXT,
      ),
    ).resolves.toMatchObject({ success: true, state: { phase: 'counting' } });
  });

  it.each([
    ['without a run id', {}],
    ['for another run', { runId: 'other-run' }],
  ])('should ask for a count before importing %s', async (_, body) => {
    kvStore.set(STATE_KV_KEY, COUNTED_STATE);

    await expect(
      teamsTranscriptHistoryImportHandler(
        buildRoutePayload(body),
        OWNER_CONTEXT,
      ),
    ).resolves.toEqual({ success: false, errorCode: 'count-required' });
  });

  it('should keep the count when the import cannot be scheduled', async () => {
    kvStore.set(STATE_KV_KEY, COUNTED_STATE);
    enqueueJobsMock.mockRejectedValue(new Error('Queue unavailable'));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(
      teamsTranscriptHistoryImportHandler(
        buildRoutePayload({ runId: 'counted-run' }),
        OWNER_CONTEXT,
      ),
    ).resolves.toEqual({ success: false, errorCode: 'unknown' });
    expect(kvStore.get(STATE_KV_KEY)).toEqual(COUNTED_STATE);
  });

  it('should not return the next page job with the status', async () => {
    kvStore.set(STATE_KV_KEY, {
      ...COUNTED_STATE,
      phase: 'importing',
      updatedAt: new Date().toISOString(),
      nextJob: {
        connectedAccountId: 'admin-connection',
        runId: 'counted-run',
        chunkIndex: 0,
        pageIndex: 1,
        attempt: 0,
      },
    });

    const result = await teamsTranscriptHistoryStatusHandler(
      buildRoutePayload(null),
      OWNER_CONTEXT,
    );

    expect(result).toMatchObject({ success: true, isStalled: false });
    expect(result.success && result.state).not.toHaveProperty('nextJob');
  });
});
