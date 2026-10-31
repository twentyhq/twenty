import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';

const mocks = vi.hoisted(() => ({
  getJobs: vi.fn(),
  enqueueJobs: vi.fn(),
  kvStore: new Map<string, unknown>(),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  getJobs: mocks.getJobs,
  enqueueJobs: mocks.enqueueJobs,
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
const PLANNING_KEY = 'linkedin-history-import-planning:connection-id:run-1';

const RUNNING_STATE: LinkedinHistoryImportState = {
  runId: 'run-1',
  importPolicy: 'ALL',
  status: 'IMPORTING',
  importedConversationCount: 0,
  processedConversationCount: 0,
  startedAt: '2026-10-30T00:00:00.000Z',
};

const LISTING_PLANNING = {
  plannedChunkCount: 3,
  plannedConversationCount: 60,
  planJobId: 'linkedin-history-plan-run-1-0',
};

const LISTED_PLANNING = {
  ...LISTING_PLANNING,
  plannedConversationCount: 45,
  reportedConversationCount: 45,
  chunkCount: 3,
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

const getEnqueuedJobIds = (): string[] =>
  mocks.enqueueJobs.mock.calls.flatMap(([input]) =>
    input.jobs.map((job: { jobId: string }) => job.jobId),
  );

describe('refreshLinkedinHistoryImportState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.kvStore.clear();
    mocks.kvStore.set(STATE_KEY, RUNNING_STATE);
    mocks.kvStore.set(PLANNING_KEY, LISTING_PLANNING);
    mockJobStates({
      'linkedin-history-plan-run-1-0': 'ACTIVE',
      'linkedin-history-chunk-run-1-1': 'ACTIVE',
    });
  });

  it('shows the listing and the chats imported so far', async () => {
    setProgress({
      completedChunkCount: 1,
      completedConversationCount: 20,
      importedConversationCount: 14,
      currentChunkProcessedCount: 7,
      currentChunkImportedCount: 3,
      currentJobId: 'linkedin-history-chunk-run-1-1',
    });

    await expect(
      refreshLinkedinHistoryImportState('connection-id'),
    ).resolves.toEqual({
      ...RUNNING_STATE,
      processedConversationCount: 27,
      importedConversationCount: 17,
      plannedChunkCount: 3,
      plannedConversationCount: 60,
      totalConversationCount: undefined,
      chunkCount: undefined,
      resumeAt: undefined,
    });
    expect(mocks.enqueueJobs).not.toHaveBeenCalled();
  });

  it('completes the run once every listed page is imported and clears its data', async () => {
    mocks.kvStore.set(PLANNING_KEY, LISTED_PLANNING);
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
    expect(mocks.kvStore.get(STATE_KEY)).toEqual(
      expect.objectContaining({ status: 'COMPLETED' }),
    );
    expect(mocks.kvStore.has(PROGRESS_KEY)).toBe(false);
    expect(mocks.kvStore.has(PLANNING_KEY)).toBe(false);
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
  });

  it('fails the run with the error the listing stored', async () => {
    mocks.kvStore.set(PLANNING_KEY, {
      ...LISTING_PLANNING,
      error: { code: 'UNKNOWN', message: 'Invalid querystring' },
    });

    await expect(
      refreshLinkedinHistoryImportState('connection-id'),
    ).resolves.toEqual(
      expect.objectContaining({
        status: 'FAILED',
        error: { code: 'UNKNOWN', message: 'Invalid querystring' },
      }),
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

  it('queues the listed page again when its job is missing', async () => {
    setProgress({ completedChunkCount: 2, completedConversationCount: 40 });

    await refreshLinkedinHistoryImportState('connection-id');

    expect(getEnqueuedJobIds()).toEqual(['linkedin-history-chunk-run-1-2']);
  });

  it('resumes a page whose job ended without finishing it', async () => {
    mocks.kvStore.set(PLANNING_KEY, LISTED_PLANNING);
    setProgress({
      completedChunkCount: 1,
      currentJobId: 'linkedin-history-chunk-run-1-1',
    });
    mockJobStates({ 'linkedin-history-chunk-run-1-1': 'COMPLETED' });

    await expect(
      refreshLinkedinHistoryImportState('connection-id'),
    ).resolves.toEqual(expect.objectContaining({ status: 'IMPORTING' }));
    expect(getEnqueuedJobIds()).toEqual([
      'linkedin-history-chunk-run-1-1-resume-1',
    ]);
    expect(mocks.kvStore.get(PROGRESS_KEY)).toEqual(
      expect.objectContaining({
        currentJobId: 'linkedin-history-chunk-run-1-1-resume-1',
        currentResumeIndex: 1,
        recoveryCount: 1,
      }),
    );
  });

  it('gives up on a page that keeps ending without progress', async () => {
    mocks.kvStore.set(PLANNING_KEY, LISTED_PLANNING);
    setProgress({
      completedChunkCount: 1,
      currentJobId: 'linkedin-history-chunk-run-1-1-resume-3',
      currentResumeIndex: 3,
      recoveryCount: 3,
    });
    mockJobStates({ 'linkedin-history-chunk-run-1-1-resume-3': 'COMPLETED' });

    await expect(
      refreshLinkedinHistoryImportState('connection-id'),
    ).resolves.toEqual(
      expect.objectContaining({
        status: 'FAILED',
        error: expect.objectContaining({ code: 'STALLED' }),
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
    mocks.kvStore.set(STATE_KEY, { ...RUNNING_STATE, status: 'CANCELLED' });

    await refreshLinkedinHistoryImportState('connection-id');

    expect(mocks.getJobs).not.toHaveBeenCalled();
  });
});
