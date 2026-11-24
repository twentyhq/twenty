import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type WhatsappHistoryImportState } from 'src/types/whatsapp-history-import-state.type';

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

const { refreshWhatsappHistoryImportState } =
  await import('src/logic-functions/utils/refresh-whatsapp-history-import-state.util');

const STATE_KEY = 'whatsapp-history-import:connection-id';
const PROGRESS_KEY = 'whatsapp-history-import-progress:connection-id:run-1';
const PLANNING_KEY = 'whatsapp-history-import-planning:connection-id:run-1';

const RUNNING_STATE: WhatsappHistoryImportState = {
  runId: 'run-1',
  importPolicy: 'ALL',
  conversationLimit: 20,
  status: 'IMPORTING',
  importedConversationCount: 0,
  processedConversationCount: 0,
  startedAt: '2026-10-30T00:00:00.000Z',
};

const LISTING_PLANNING = {
  plannedChunkCount: 3,
  plannedConversationCount: 60,
  planJobId: 'whatsapp-history-plan-run-1-0',
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

describe('refreshWhatsappHistoryImportState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.kvStore.clear();
    mocks.kvStore.set(STATE_KEY, RUNNING_STATE);
    mocks.kvStore.set(PLANNING_KEY, LISTING_PLANNING);
    mockJobStates({
      'whatsapp-history-plan-run-1-0': 'ACTIVE',
      'whatsapp-history-chunk-run-1-1': 'ACTIVE',
    });
  });

  it('shows the listing and the chats imported so far', async () => {
    setProgress({
      completedChunkCount: 1,
      completedConversationCount: 20,
      importedConversationCount: 14,
      currentChunkProcessedCount: 7,
      currentChunkImportedCount: 3,
      currentJobId: 'whatsapp-history-chunk-run-1-1',
    });

    await expect(
      refreshWhatsappHistoryImportState('connection-id'),
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
      'whatsapp-history-import-chats:connection-id:run-1:2',
      [],
    );
    setProgress({
      completedChunkCount: 3,
      completedConversationCount: 45,
      importedConversationCount: 31,
    });

    await expect(
      refreshWhatsappHistoryImportState('connection-id'),
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
      mocks.kvStore.has('whatsapp-history-import-chats:connection-id:run-1:2'),
    ).toBe(false);
  });

  it('fails the run with the error a page stored', async () => {
    setProgress({
      completedChunkCount: 1,
      error: { code: 'AUTH_FAILED', message: 'Signed out' },
    });

    await expect(
      refreshWhatsappHistoryImportState('connection-id'),
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
      refreshWhatsappHistoryImportState('connection-id'),
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
      'whatsapp-history-plan-run-1-0': 'ACTIVE',
      'whatsapp-history-chunk-run-1-1': 'FAILED',
    });

    await expect(
      refreshWhatsappHistoryImportState('connection-id'),
    ).resolves.toEqual(
      expect.objectContaining({
        status: 'FAILED',
        error: { code: 'UNKNOWN', message: 'Boom' },
      }),
    );
  });

  it('queues the listed page again when its job is missing', async () => {
    setProgress({ completedChunkCount: 2, completedConversationCount: 40 });

    await refreshWhatsappHistoryImportState('connection-id');

    expect(getEnqueuedJobIds()).toEqual(['whatsapp-history-chunk-run-1-2']);
  });

  it('resumes a page whose job ended without finishing it', async () => {
    mocks.kvStore.set(PLANNING_KEY, LISTED_PLANNING);
    setProgress({
      completedChunkCount: 1,
      currentJobId: 'whatsapp-history-chunk-run-1-1',
    });
    mockJobStates({ 'whatsapp-history-chunk-run-1-1': 'COMPLETED' });

    await expect(
      refreshWhatsappHistoryImportState('connection-id'),
    ).resolves.toEqual(expect.objectContaining({ status: 'IMPORTING' }));
    expect(getEnqueuedJobIds()).toEqual([
      'whatsapp-history-chunk-run-1-1-resume-1',
    ]);
    expect(mocks.kvStore.get(PROGRESS_KEY)).toEqual(
      expect.objectContaining({
        currentJobId: 'whatsapp-history-chunk-run-1-1-resume-1',
        currentResumeIndex: 1,
        recoveryCount: 1,
      }),
    );
  });

  it('gives up on a page that keeps ending without progress', async () => {
    mocks.kvStore.set(PLANNING_KEY, LISTED_PLANNING);
    setProgress({
      completedChunkCount: 1,
      currentJobId: 'whatsapp-history-chunk-run-1-1-resume-3',
      currentResumeIndex: 3,
      recoveryCount: 3,
    });
    mockJobStates({ 'whatsapp-history-chunk-run-1-1-resume-3': 'COMPLETED' });

    await expect(
      refreshWhatsappHistoryImportState('connection-id'),
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
      refreshWhatsappHistoryImportState('connection-id'),
    ).resolves.toEqual(
      expect.objectContaining({
        status: 'FAILED',
        error: expect.objectContaining({ code: 'STALLED' }),
      }),
    );
  });

  it('leaves a finished run as it is', async () => {
    mocks.kvStore.set(STATE_KEY, { ...RUNNING_STATE, status: 'CANCELLED' });

    await refreshWhatsappHistoryImportState('connection-id');

    expect(mocks.getJobs).not.toHaveBeenCalled();
  });
});
