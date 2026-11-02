import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';

const mocks = vi.hoisted(() => ({
  getConnection: vi.fn(),
  enqueueJobs: vi.fn(),
  kvStore: new Map<string, unknown>(),
  listUnipileInboxIds: vi.fn(),
  listUnipileChats: vi.fn(),
}));

vi.mock('twenty-sdk/define', () => ({
  defineLogicFunction: (config: unknown) => config,
}));

vi.mock('twenty-sdk/logic-function', () => ({
  AppConnectionAuthFailedError: class extends Error {},
  RetryableLogicFunctionError: class RetryableLogicFunctionError extends Error {},
  getConnection: mocks.getConnection,
  enqueueJobs: mocks.enqueueJobs,
  kv: {
    get: async (key: string) => mocks.kvStore.get(key) ?? null,
    set: async (key: string, value: unknown) => {
      mocks.kvStore.set(key, value);
    },
  },
}));

vi.mock('src/unipile/utils/list-unipile-inbox-ids.util', () => ({
  listUnipileInboxIds: mocks.listUnipileInboxIds,
}));

vi.mock('src/unipile/utils/list-unipile-chats.util', () => ({
  listUnipileChats: mocks.listUnipileChats,
}));

const { UnipileRateLimitError } =
  await import('src/unipile/utils/request-unipile.util');

const { linkedinPlanHistoryImportHandler } =
  await import('src/logic-functions/linkedin-plan-history-import');

const STATE_KEY = 'linkedin-history-import:connection-id';
const PLANNING_KEY = 'linkedin-history-import-planning:connection-id:run-1';

const RUNNING_STATE: LinkedinHistoryImportState = {
  runId: 'run-1',
  importPolicy: 'ALL',
  status: 'IMPORTING',
  importedConversationCount: 0,
  processedConversationCount: 0,
  startedAt: '2026-10-30T00:00:00.000Z',
};

const PAYLOAD = { connectedAccountId: 'connection-id', runId: 'run-1' };

const buildChatIds = (count: number, offset = 0) =>
  Array.from({ length: count }, (_, index) => `chat-${offset + index}`);

const mockChatPages = (pageSizes: number[]) => {
  pageSizes.forEach((pageSize, pageIndex) =>
    mocks.listUnipileChats.mockResolvedValueOnce({
      items: buildChatIds(pageSize, pageIndex * 20).map((id, index) => ({
        id,
        last_message_timestamp: new Date(
          Date.UTC(2026, 0, 1) - (pageIndex * 20 + index) * 60_000,
        ).toISOString(),
      })),
      nextCursor:
        pageIndex < pageSizes.length - 1
          ? `cursor-${pageIndex + 1}`
          : undefined,
    }),
  );
};

const getEnqueuedJobIds = (): string[] =>
  mocks.enqueueJobs.mock.calls.flatMap(([input]) =>
    input.jobs.map((job: { jobId: string }) => job.jobId),
  );

const getStoredChatIds = (chunkIndex: number) =>
  (
    mocks.kvStore.get(
      `linkedin-history-import-chats:connection-id:run-1:${chunkIndex}`,
    ) as { id: string }[] | undefined
  )?.map((chat) => chat.id);

describe('linkedinPlanHistoryImportHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    mocks.listUnipileChats.mockReset();
    mocks.kvStore.clear();
    mocks.kvStore.set(STATE_KEY, RUNNING_STATE);
    mocks.getConnection.mockResolvedValue({ externalAccountId: 'acc_1' });
    mocks.listUnipileInboxIds.mockResolvedValue(['inbox-1']);
  });

  it('stores each page of chats for the import jobs, most recent first', async () => {
    mockChatPages([20, 20, 5]);

    await expect(linkedinPlanHistoryImportHandler(PAYLOAD)).resolves.toEqual({
      status: 'PLANNED',
      chunkCount: 3,
    });

    expect(getStoredChatIds(0)).toEqual(buildChatIds(20));
    expect(getStoredChatIds(2)).toEqual(buildChatIds(5, 40));
    expect(mocks.kvStore.get(STATE_KEY)).toEqual(RUNNING_STATE);
    expect(mocks.kvStore.get(PLANNING_KEY)).toEqual({
      plannedChunkCount: 3,
      plannedConversationCount: 45,
      reportedConversationCount: 45,
      chunkCount: 3,
      planJobId: 'linkedin-history-plan-run-1-0',
    });
  });

  it('starts the import chain on the first page only', async () => {
    mockChatPages([20, 20, 5]);

    await linkedinPlanHistoryImportHandler(PAYLOAD);

    expect(getEnqueuedJobIds()).toEqual(['linkedin-history-chunk-run-1-0']);
  });

  it('restarts the import chain when it caught up with the listing', async () => {
    mocks.kvStore.set('linkedin-history-import-progress:connection-id:run-1', {
      completedChunkCount: 1,
      completedConversationCount: 20,
      importedConversationCount: 12,
      currentChunkProcessedCount: 0,
    });
    mockChatPages([20, 20]);

    await linkedinPlanHistoryImportHandler(PAYLOAD);

    expect(getEnqueuedJobIds()).toEqual(['linkedin-history-chunk-run-1-1']);
  });

  it('sorts each page by the date of its last message', async () => {
    mocks.listUnipileChats.mockResolvedValueOnce({
      items: [
        { id: 'older', last_message_timestamp: '2026-01-01T00:00:00.000Z' },
        { id: 'newer', last_message_timestamp: '2026-02-01T00:00:00.000Z' },
      ],
      nextCursor: undefined,
    });

    await linkedinPlanHistoryImportHandler(PAYLOAD);

    expect(getStoredChatIds(0)).toEqual(['newer', 'older']);
  });

  it('shows the total LinkedIn reports while still listing', async () => {
    let stateWhileListing: unknown;

    mocks.listUnipileChats
      .mockResolvedValueOnce({
        items: [{ id: 'chat-0' }],
        nextCursor: 'cursor-1',
        totalCount: 340,
      })
      .mockImplementationOnce(async () => {
        stateWhileListing = mocks.kvStore.get(PLANNING_KEY);

        return { items: [{ id: 'chat-1' }], nextCursor: undefined };
      });

    await linkedinPlanHistoryImportHandler(PAYLOAD);

    expect(stateWhileListing).toEqual({
      plannedChunkCount: 1,
      plannedConversationCount: 1,
      reportedConversationCount: 340,
      planJobId: 'linkedin-history-plan-run-1-0',
    });
  });

  it('hands over to a new planning job when its time runs out', async () => {
    vi.useFakeTimers({ now: 0 });
    mocks.listUnipileChats.mockImplementation(async ({ cursor }) => {
      vi.setSystemTime(Date.now() + 4 * 60 * 1000);

      return {
        items: buildChatIds(20).map((id) => ({ id })),
        nextCursor: `${cursor ?? ''}+`,
      };
    });

    await expect(linkedinPlanHistoryImportHandler(PAYLOAD)).resolves.toEqual({
      status: 'CONTINUED',
    });

    const continuation = mocks.enqueueJobs.mock.lastCall?.[0].jobs[0];

    expect(continuation).toEqual({
      jobId: 'linkedin-history-plan-run-1-1',
      payload: {
        connectedAccountId: 'connection-id',
        runId: 'run-1',
        continuationIndex: 1,
        inboxIndex: 0,
        cursor: '+++',
        plannedChunkCount: 3,
        plannedConversationCount: 60,
        reportedConversationCount: undefined,
      },
    });
    expect(mocks.kvStore.get(PLANNING_KEY)).toEqual({
      plannedChunkCount: 3,
      plannedConversationCount: 60,
      reportedConversationCount: undefined,
      planJobId: 'linkedin-history-plan-run-1-1',
      resumeAt: undefined,
    });
  });

  it('pauses the listing until the limit resets and resumes where it stopped', async () => {
    mocks.listUnipileChats
      .mockResolvedValueOnce({
        items: [{ id: 'chat-0' }],
        nextCursor: 'cursor-1',
      })
      .mockRejectedValueOnce(
        new UnipileRateLimitError('Retry in 2 hours.', 2 * 60 * 60 + 1),
      );

    await expect(linkedinPlanHistoryImportHandler(PAYLOAD)).resolves.toEqual({
      status: 'CONTINUED',
    });

    expect(mocks.enqueueJobs.mock.lastCall?.[0]).toEqual(
      expect.objectContaining({
        jobs: [
          {
            jobId: 'linkedin-history-plan-run-1-1',
            payload: expect.objectContaining({
              inboxIndex: 0,
              cursor: 'cursor-1',
              plannedChunkCount: 1,
            }),
          },
        ],
        delayMs: (2 * 60 * 60 + 1) * 1000,
      }),
    );
    expect(mocks.kvStore.get(PLANNING_KEY)).toEqual(
      expect.objectContaining({
        planJobId: 'linkedin-history-plan-run-1-1',
        resumeAt: expect.any(String),
      }),
    );
  });

  it('records a run with no conversations as fully listed', async () => {
    mockChatPages([0]);

    await linkedinPlanHistoryImportHandler(PAYLOAD);

    expect(mocks.enqueueJobs).not.toHaveBeenCalled();
    expect(mocks.kvStore.get(PLANNING_KEY)).toEqual(
      expect.objectContaining({ chunkCount: 0 }),
    );
  });

  it('lists nothing for a cancelled run', async () => {
    mocks.kvStore.set(STATE_KEY, { ...RUNNING_STATE, status: 'CANCELLED' });

    await expect(linkedinPlanHistoryImportHandler(PAYLOAD)).resolves.toEqual({
      status: 'CANCELLED',
    });
    expect(mocks.listUnipileChats).not.toHaveBeenCalled();
  });

  it('records a listing error Twenty will not retry', async () => {
    mocks.listUnipileChats.mockRejectedValue({
      status: 400,
      title: 'Invalid querystring',
    });

    await expect(
      linkedinPlanHistoryImportHandler(PAYLOAD, {
        retryCount: 0,
        maxRetries: 3,
      }),
    ).rejects.toThrow('Invalid querystring');
    expect(mocks.kvStore.get(STATE_KEY)).toEqual(RUNNING_STATE);
    expect(mocks.kvStore.get(PLANNING_KEY)).toEqual(
      expect.objectContaining({
        error: { code: 'UNKNOWN', message: 'Invalid querystring' },
      }),
    );
  });
});
