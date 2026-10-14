import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/transcripts/constants/transcripts-enabled-application-variable-key';
import { startTeamsTranscriptHistoryInitialImportOrThrow } from 'src/features/transcripts/logic-functions/utils/start-teams-transcript-history-initial-import-or-throw';

const { kvStore, enqueueJobsMock, listConnectionsMock } = vi.hoisted(() => ({
  kvStore: new Map<string, unknown>(),
  enqueueJobsMock: vi.fn(),
  listConnectionsMock: vi.fn(),
}));

vi.mock('src/constants/feature-flags', () => ({
  FEATURE_FLAGS: { IS_TRANSCRIPT_IMPORT_ENABLED: true },
}));

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  kv: {
    get: async (key: string) => kvStore.get(key) ?? null,
    set: async (key: string, value: unknown) => {
      kvStore.set(key, value);
    },
    delete: async (key: string) => {
      kvStore.delete(key);
    },
  },
  enqueueJobs: enqueueJobsMock,
  listConnections: listConnectionsMock,
}));

const CONNECTED_ACCOUNT_ID = 'connected-account-1';

const STATE_KV_KEY = `teams-transcript-history:${CONNECTED_ACCOUNT_ID}`;

const INITIAL_IMPORT_KV_KEY = `teams-transcript-history-initial-import:${CONNECTED_ACCOUNT_ID}`;

const NOW = Date.parse('2026-09-15T00:00:00.000Z');

const EXISTING_STATE = {
  runId: 'run-1',
  windowStart: '2026-08-15T00:00:00.000Z',
  windowEnd: '2026-09-15T00:00:00.000Z',
  phase: 'importing',
  pageCount: 2,
  updatedAt: new Date(NOW - 60_000).toISOString(),
};

const startInitialImport = () =>
  startTeamsTranscriptHistoryInitialImportOrThrow({
    connectedAccountId: CONNECTED_ACCOUNT_ID,
  });

describe('startTeamsTranscriptHistoryInitialImportOrThrow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ now: NOW });
    kvStore.clear();
    process.env[TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY] = 'true';
    enqueueJobsMock.mockResolvedValue(undefined);
    listConnectionsMock.mockResolvedValue([{ id: CONNECTED_ACCOUNT_ID }]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should import the last 31 days of a new connection', async () => {
    await startInitialImport();

    const state = kvStore.get(STATE_KV_KEY) as typeof EXISTING_STATE;

    expect(kvStore.get(INITIAL_IMPORT_KV_KEY)).toBe(true);
    expect(state).toMatchObject({
      windowStart: '2026-08-15T00:00:00.000Z',
      windowEnd: '2026-09-15T00:00:00.000Z',
      phase: 'importing',
      pageCount: 0,
    });
    expect(enqueueJobsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        jobs: [
          expect.objectContaining({
            payload: {
              connectedAccountId: CONNECTED_ACCOUNT_ID,
              runId: state.runId,
              chunkIndex: 0,
              pageIndex: 0,
              attempt: 0,
            },
          }),
        ],
      }),
    );
  });

  it.each([
    ['is running', EXISTING_STATE],
    ['finished', { ...EXISTING_STATE, phase: 'imported' }],
    [
      'reached the page limit',
      { ...EXISTING_STATE, phase: 'failed', errorCode: 'page-limit-reached' },
    ],
  ])('should keep an import that %s', async (_, existingState) => {
    kvStore.set(INITIAL_IMPORT_KV_KEY, true);
    kvStore.set(STATE_KV_KEY, existingState);

    await startInitialImport();

    expect(kvStore.get(STATE_KV_KEY)).toBe(existingState);
    expect(enqueueJobsMock).not.toHaveBeenCalled();
  });

  it.each([
    ['failed', { ...EXISTING_STATE, phase: 'failed' }],
    [
      'stalled',
      {
        ...EXISTING_STATE,
        updatedAt: new Date(NOW - 41 * 60_000).toISOString(),
      },
    ],
  ])('should restart an import that %s', async (_, existingState) => {
    kvStore.set(INITIAL_IMPORT_KV_KEY, true);
    kvStore.set(STATE_KV_KEY, existingState);

    await startInitialImport();

    expect(kvStore.get(STATE_KV_KEY)).toMatchObject({
      phase: 'importing',
      pageCount: 0,
    });
    expect(kvStore.get(STATE_KV_KEY)).not.toMatchObject({ runId: 'run-1' });
    expect(enqueueJobsMock).toHaveBeenCalledTimes(1);
  });

  it('should import the last 31 days even when a count already ran on the connection', async () => {
    kvStore.set(STATE_KV_KEY, { ...EXISTING_STATE, phase: 'counted' });

    await startInitialImport();

    expect(kvStore.get(STATE_KV_KEY)).toMatchObject({
      phase: 'importing',
      pageCount: 0,
    });
    expect(enqueueJobsMock).toHaveBeenCalledTimes(1);
  });

  it('should mark the import failed when its first page cannot be scheduled', async () => {
    enqueueJobsMock.mockRejectedValue(new Error('queue unavailable'));

    await expect(startInitialImport()).rejects.toThrow('queue unavailable');
    expect(kvStore.get(STATE_KV_KEY)).toMatchObject({ phase: 'failed' });
  });

  it('should remove the import state of a connection removed while it started', async () => {
    listConnectionsMock.mockResolvedValue([]);

    await startInitialImport();

    expect(kvStore.size).toBe(0);
  });

  it('should not import anything while transcripts are off', async () => {
    process.env[TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY] = 'false';

    await startInitialImport();

    expect(kvStore.size).toBe(0);
    expect(enqueueJobsMock).not.toHaveBeenCalled();
  });
});
