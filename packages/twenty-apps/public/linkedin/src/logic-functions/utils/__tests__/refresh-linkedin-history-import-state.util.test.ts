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

const getChunkKey = (chunkIndex: number) =>
  `linkedin-history-import-chunk:connection-id:run-1:${chunkIndex}`;

const PLANNED_STATE: LinkedinHistoryImportState = {
  runId: 'run-1',
  importPolicy: 'ALL',
  status: 'IMPORTING',
  importedConversationCount: 0,
  processedConversationCount: 0,
  totalConversationCount: 45,
  chunkCount: 3,
  startedAt: '2026-10-30T00:00:00.000Z',
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

describe('refreshLinkedinHistoryImportState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.kvStore.clear();
    mocks.kvStore.set(STATE_KEY, PLANNED_STATE);
  });

  it('counts the conversations of finished chunks while others run', async () => {
    mockJobStates({
      'linkedin-history-chunk-run-1-0': 'COMPLETED',
      'linkedin-history-chunk-run-1-1': 'ACTIVE',
      'linkedin-history-chunk-run-1-2': 'PRIORITIZED',
    });

    await expect(
      refreshLinkedinHistoryImportState('connection-id'),
    ).resolves.toEqual({ ...PLANNED_STATE, processedConversationCount: 20 });
  });

  it('completes the run once every chunk finished and clears their results', async () => {
    mockJobStates({
      'linkedin-history-chunk-run-1-0': 'COMPLETED',
      'linkedin-history-chunk-run-1-1': 'COMPLETED',
    });
    mocks.kvStore.set(getChunkKey(0), { importedConversationCount: 12 });
    mocks.kvStore.set(getChunkKey(1), { importedConversationCount: 7 });
    mocks.kvStore.set(getChunkKey(2), { importedConversationCount: 1 });

    await expect(
      refreshLinkedinHistoryImportState('connection-id'),
    ).resolves.toEqual(
      expect.objectContaining({
        status: 'COMPLETED',
        importedConversationCount: 20,
        processedConversationCount: 45,
      }),
    );
    expect(mocks.kvStore.has(getChunkKey(0))).toBe(false);
  });

  it('fails the run with the error of a failed chunk', async () => {
    mockJobStates({
      'linkedin-history-chunk-run-1-0': 'COMPLETED',
      'linkedin-history-chunk-run-1-1': 'FAILED',
      'linkedin-history-chunk-run-1-2': 'PRIORITIZED',
    });
    mocks.kvStore.set(getChunkKey(1), {
      importedConversationCount: 0,
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

  it('keeps a run importing while its planning job is queued', async () => {
    const planningState = {
      ...PLANNED_STATE,
      totalConversationCount: undefined,
      chunkCount: undefined,
    };

    mocks.kvStore.set(STATE_KEY, planningState);
    mockJobStates({ 'linkedin-history-plan-run-1-0': 'ACTIVE' });

    await expect(
      refreshLinkedinHistoryImportState('connection-id'),
    ).resolves.toEqual(planningState);
  });

  it('fails a run whose planning job is gone', async () => {
    mocks.kvStore.set(STATE_KEY, {
      ...PLANNED_STATE,
      totalConversationCount: undefined,
      chunkCount: undefined,
    });
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
    mocks.kvStore.set(STATE_KEY, { ...PLANNED_STATE, status: 'CANCELLED' });

    await refreshLinkedinHistoryImportState('connection-id');

    expect(mocks.getJobs).not.toHaveBeenCalled();
  });
});
