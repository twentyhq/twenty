import { isArray, isObject } from '@sniptt/guards';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type WhatsappHistoryImportState } from 'src/types/whatsapp-history-import-state.type';

const mocks = vi.hoisted(() => ({
  getConnection: vi.fn(),
  enqueueJobs: vi.fn(),
  kvStore: new Map<string, unknown>(),
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

vi.mock('src/unipile/utils/list-unipile-chats.util', () => ({
  listUnipileChats: mocks.listUnipileChats,
}));

const { UnipileRateLimitError } =
  await import('src/unipile/utils/request-unipile.util');

const { whatsappPlanHistoryImportHandler } =
  await import('src/logic-functions/whatsapp-plan-history-import');

const STATE_KEY = 'whatsapp-history-import:connection-id';
const PLANNING_KEY = 'whatsapp-history-import-planning:connection-id:run-1';

const RUNNING_STATE: WhatsappHistoryImportState = {
  runId: 'run-1',
  importPolicy: 'ALL',
  conversationLimit: 50,
  status: 'IMPORTING',
  importedConversationCount: 0,
  processedConversationCount: 0,
  startedAt: '2026-10-30T00:00:00.000Z',
};

const PAYLOAD = { connectedAccountId: 'connection-id', runId: 'run-1' };

const buildChatIds = ({
  count,
  offset = 0,
}: {
  count: number;
  offset?: number;
}) => Array.from({ length: count }, (_, index) => `chat-${offset + index}`);

const mockChatPages = (pageSizes: number[]) => {
  pageSizes.forEach((pageSize, pageIndex) =>
    mocks.listUnipileChats.mockResolvedValueOnce({
      items: buildChatIds({ count: pageSize, offset: pageIndex * 20 }).map(
        (id, index) => ({
          id,
          last_message_timestamp: new Date(
            Date.UTC(2026, 0, 1) - (pageIndex * 20 + index) * 60_000,
          ).toISOString(),
        }),
      ),
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

const getStoredChatIds = (chunkIndex: number) => {
  const chats = mocks.kvStore.get(
    `whatsapp-history-import-chats:connection-id:run-1:${chunkIndex}`,
  );

  return isArray(chats)
    ? chats.map((chat) => (isObject(chat) && 'id' in chat ? chat.id : chat))
    : undefined;
};

describe('whatsappPlanHistoryImportHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    mocks.listUnipileChats.mockReset();
    mocks.kvStore.clear();
    mocks.kvStore.set(STATE_KEY, RUNNING_STATE);
    mocks.getConnection.mockResolvedValue({ externalAccountId: 'acc_1' });
  });

  it('stores the most recent conversations for the import jobs, 20 at a time', async () => {
    mockChatPages([20, 20, 5]);

    await expect(whatsappPlanHistoryImportHandler(PAYLOAD)).resolves.toEqual({
      status: 'PLANNED',
      chunkCount: 3,
    });

    expect(getStoredChatIds(0)).toEqual(buildChatIds({ count: 20 }));
    expect(getStoredChatIds(2)).toEqual(buildChatIds({ count: 5, offset: 40 }));
    expect(mocks.kvStore.get(STATE_KEY)).toEqual(RUNNING_STATE);
    expect(mocks.kvStore.get(PLANNING_KEY)).toEqual({
      plannedChunkCount: 3,
      plannedConversationCount: 45,
      reportedConversationCount: 45,
      chunkCount: 3,
      planJobId: 'whatsapp-history-plan-run-1-0',
    });
  });

  it('asks WhatsApp for no more conversations than the member chose', async () => {
    mocks.kvStore.set(STATE_KEY, { ...RUNNING_STATE, conversationLimit: 20 });
    mockChatPages([15, 5]);

    await whatsappPlanHistoryImportHandler(PAYLOAD);

    expect(
      mocks.listUnipileChats.mock.calls.map(([input]) => [
        input.limit,
        input.cursor,
      ]),
    ).toEqual([
      [20, undefined],
      [5, 'cursor-1'],
    ]);
    expect(getStoredChatIds(0)).toHaveLength(20);
    expect(getStoredChatIds(1)).toBeUndefined();
  });

  it('hands the conversations the member selected to the import jobs, most recent first', async () => {
    mocks.kvStore.set(STATE_KEY, {
      ...RUNNING_STATE,
      importPolicy: 'SELECTED',
    });
    mocks.kvStore.set('whatsapp-settings:connection-id', {
      importPolicy: 'SELECTED',
      selectedChats: ['chat-old', 'chat-1', 'chat-3'].map((id) => ({
        id,
        name: id,
      })),
    });
    mockChatPages([5]);

    await expect(whatsappPlanHistoryImportHandler(PAYLOAD)).resolves.toEqual({
      status: 'PLANNED',
      chunkCount: 1,
    });

    expect(getStoredChatIds(0)).toEqual(['chat-1', 'chat-3', 'chat-old']);
  });

  it('starts the import chain on the first page only', async () => {
    mockChatPages([20, 20, 5]);

    await whatsappPlanHistoryImportHandler(PAYLOAD);

    expect(getEnqueuedJobIds()).toEqual(['whatsapp-history-chunk-run-1-0']);
  });

  it('restarts the import chain when it caught up with the listing', async () => {
    mocks.kvStore.set('whatsapp-history-import-progress:connection-id:run-1', {
      completedChunkCount: 1,
      completedConversationCount: 20,
      importedConversationCount: 12,
      currentChunkProcessedCount: 0,
    });
    mockChatPages([20, 20]);

    await whatsappPlanHistoryImportHandler(PAYLOAD);

    expect(getEnqueuedJobIds()).toEqual(['whatsapp-history-chunk-run-1-1']);
  });

  it('stops waiting on Unipile before the planning job runs out of time', async () => {
    vi.useFakeTimers({ now: 0 });
    mockChatPages([5]);

    await whatsappPlanHistoryImportHandler(PAYLOAD);

    expect(mocks.listUnipileChats).toHaveBeenCalledWith(
      expect.objectContaining({ deadlineAtMs: 10 * 60 * 1000 }),
    );
  });

  it('lists again once the rate limit resets', async () => {
    vi.useFakeTimers({ now: 0 });
    mocks.listUnipileChats.mockRejectedValueOnce(
      new UnipileRateLimitError('Retry in 2 hours.', 2 * 60 * 60 + 1),
    );

    await expect(whatsappPlanHistoryImportHandler(PAYLOAD)).resolves.toEqual({
      status: 'CONTINUED',
    });

    expect(mocks.enqueueJobs.mock.lastCall?.[0]).toEqual(
      expect.objectContaining({
        jobs: [
          {
            jobId: 'whatsapp-history-plan-run-1-1',
            payload: { ...PAYLOAD, continuationIndex: 1 },
          },
        ],
        delayMs: (2 * 60 * 60 + 1) * 1000,
      }),
    );
    expect(mocks.kvStore.get(PLANNING_KEY)).toEqual({
      plannedChunkCount: 0,
      plannedConversationCount: 0,
      planJobId: 'whatsapp-history-plan-run-1-1',
      resumeAt: new Date((2 * 60 * 60 + 1) * 1000).toISOString(),
    });
  });

  it('records a run with no conversations as fully listed', async () => {
    mockChatPages([0]);

    await whatsappPlanHistoryImportHandler(PAYLOAD);

    expect(mocks.enqueueJobs).not.toHaveBeenCalled();
    expect(mocks.kvStore.get(PLANNING_KEY)).toEqual(
      expect.objectContaining({ chunkCount: 0 }),
    );
  });

  it('lists nothing for a cancelled run', async () => {
    mocks.kvStore.set(STATE_KEY, { ...RUNNING_STATE, status: 'CANCELLED' });

    await expect(whatsappPlanHistoryImportHandler(PAYLOAD)).resolves.toEqual({
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
      whatsappPlanHistoryImportHandler(PAYLOAD, {
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
