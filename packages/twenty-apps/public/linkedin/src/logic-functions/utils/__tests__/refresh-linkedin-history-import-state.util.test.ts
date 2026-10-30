import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';

const mocks = vi.hoisted(() => ({
  getJobs: vi.fn(),
  kvStore: new Map<string, unknown>(),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  getJobs: mocks.getJobs,
  kv: {
    get: async (key: string) => mocks.kvStore.get(key) ?? null,
    set: async (key: string, value: unknown) => {
      mocks.kvStore.set(key, value);
    },
    delete: async (key: string) => mocks.kvStore.delete(key),
  },
}));

const { refreshLinkedinHistoryImportState } =
  await import('src/logic-functions/utils/refresh-linkedin-history-import-state.util');

const STATE_KEY = 'linkedin-history-import:connection-id';
const PROGRESS_KEY = 'linkedin-history-import-progress:connection-id:run-1';

const LISTING_STATE: LinkedinHistoryImportState = {
  runId: 'run-1',
  importPolicy: 'ALL',
  status: 'IMPORTING',
  importedConversationCount: 0,
  processedConversationCount: 0,
  plannedChunkCount: 3,
  plannedConversationCount: 60,
  startedAt: '2026-10-30T00:00:00.000Z',
};

const LISTED_STATE: LinkedinHistoryImportState = {
  ...LISTING_STATE,
  chunkCount: 3,
  totalConversationCount: 45,
};

const mockJobStates = (states: Record<string, string>) =>
  mocks.getJobs.mockImplementation(async (jobIds: string[]) =>
    jobIds
      .filter((jobId) => jobId in states)
      .map((jobId) => ({
        jobId,
        state: states[jobId],
        failedReason: states[jobId] === 'FAILED' ? 'Boom' : null,
      })),
  );

const setProgress = (progress: Record<string, unknown>) =>
  mocks.kvStore.set(PROGRESS_KEY, {
    completedChunkCount: 0,
    completedConversationCount: 0,
    importedConversationCount: 0,
    currentChunkProcessedCount: 0,
    ...progress,
  });

describe('refreshLinkedinHistoryImportState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.kvStore.clear();
    mocks.kvStore.set(STATE_KEY, LISTING_STATE);
    mockJobStates({
      'linkedin-history-plan-run-1-0': 'ACTIVE',
      'linkedin-history-chunk-run-1-1': 'ACTIVE',
    });
  });

  it('counts the chats of finished pages and of the page being imported', async () => {
    setProgress({
      completedChunkCount: 1,
      completedConversationCount: 20,
      importedConversationCount: 14,
      currentChunkProcessedCount: 7,
    });

    await expect(
      refreshLinkedinHistoryImportState('connection-id'),
    ).resolves.toEqual({
      ...LISTING_STATE,
      processedConversationCount: 27,
      importedConversationCount: 14,
    });
  });

  it('completes the run once every listed page is imported and clears its data', async () => {
    mocks.kvStore.set(STATE_KEY, LISTED_STATE);
    mocks.kvStore.set(
      'linkedin-history-import-chats:connection-id:run-1:2',
      [],
    );
    setProgress({
      completedChunkCount: 3,
      completedConversationCount: 45,
      importedConversationCount: 31,
    });

    await expect(
      refreshLinkedinHistoryImportState('connection-id'),
    ).resolves.toEqual(
      expect.objectContaining({
        status: 'COMPLETED',
        importedConversationCount: 31,
        processedConversationCount: 45,
      }),
    );
    expect(mocks.kvStore.has(PROGRESS_KEY)).toBe(false);
    expect(
      mocks.kvStore.has('linkedin-history-import-chats:connection-id:run-1:2'),
    ).toBe(false);
  });

  it('fails the run with the error a page stored', async () => {
    setProgress({
      completedChunkCount: 1,
      error: { code: 'AUTH_FAILED', message: 'Signed out' },
    });

    await expect(
      refreshLinkedinHistoryImportState('connection-id'),
    ).resolves.toEqual(
      expect.objectContaining({
        status: 'FAILED',
        error: { code: 'AUTH_FAILED', message: 'Signed out' },
      }),
    );
    expect(mocks.kvStore.get(STATE_KEY)).toEqual(
      expect.objectContaining({ status: 'FAILED' }),
    );
  });

  it('fails the run when the page being imported failed', async () => {
    setProgress({ completedChunkCount: 1 });
    mockJobStates({
      'linkedin-history-plan-run-1-0': 'ACTIVE',
      'linkedin-history-chunk-run-1-1': 'FAILED',
    });

    await expect(
      refreshLinkedinHistoryImportState('connection-id'),
    ).resolves.toEqual(
      expect.objectContaining({
        status: 'FAILED',
        error: { code: 'UNKNOWN', message: 'Boom' },
      }),
    );
  });

  it('fails a run whose planning job is gone', async () => {
    mockJobStates({});

    await expect(
      refreshLinkedinHistoryImportState('connection-id'),
    ).resolves.toEqual(
      expect.objectContaining({
        status: 'FAILED',
        error: expect.objectContaining({ code: 'STALLED' }),
      }),
    );
  });

  it('leaves a finished run as it is', async () => {
    mocks.kvStore.set(STATE_KEY, { ...LISTING_STATE, status: 'CANCELLED' });

    await refreshLinkedinHistoryImportState('connection-id');

    expect(mocks.getJobs).not.toHaveBeenCalled();
  });
});
