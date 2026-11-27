import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type WhatsappHistoryImportState } from 'src/types/whatsapp-history-import-state.type';
import { getWhatsappChatJobIdSegment } from 'src/logic-functions/utils/get-whatsapp-history-import-job-id.util';

const mocks = vi.hoisted(() => ({
  getConnection: vi.fn(),
  listMessageChannels: vi.fn(),
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
  listMessageChannels: mocks.listMessageChannels,
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

// Newest first across pages, but shuffled inside each page as Unipile may return them
const mockChatPages = (pageSizes: number[]) => {
  let chatIndex = 0;

  pageSizes.forEach((pageSize, pageIndex) => {
    const items = Array.from({ length: pageSize }, () => {
      const index = chatIndex++;

      return {
        id: `chat-${index}`,
        last_message_timestamp: new Date(
          Date.UTC(2026, 0, 1) - index * 60_000,
        ).toISOString(),
      };
    }).reverse();

    mocks.listUnipileChats.mockResolvedValueOnce({
      items,
      nextCursor:
        pageIndex < pageSizes.length - 1
          ? `cursor-${pageIndex + 1}`
          : undefined,
    });
  });
};

const getEnqueueInputs = () =>
  mocks.enqueueJobs.mock.calls.map(([input]) => input);

describe('whatsappPlanHistoryImportHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    mocks.kvStore.clear();
    mocks.kvStore.set(STATE_KEY, RUNNING_STATE);
    mocks.getConnection.mockResolvedValue({ externalAccountId: 'acc_1' });
    mocks.listMessageChannels.mockResolvedValue([
      { id: 'channel-id', handle: '+33600000000' },
    ]);
    mocks.listUnipileChats.mockReset();
  });

  it('lists the conversations most recent first and starts their contacts with the latest one only', async () => {
    mockChatPages([25, 25, 10]);

    await expect(whatsappPlanHistoryImportHandler(PAYLOAD)).resolves.toEqual({
      status: 'PLANNED',
      conversationCount: 50,
    });

    const chatIds = Array.from({ length: 50 }, (_, index) => `chat-${index}`);

    expect(getEnqueueInputs()).toEqual([
      expect.objectContaining({
        limiter: { max: 60, durationMs: 60_000 },
        jobs: [
          expect.objectContaining({
            jobId: `whatsapp-history-contacts-run-1-${getWhatsappChatJobIdSegment('chat-0')}-0`,
          }),
        ],
      }),
    ]);
    expect(mocks.kvStore.get(PLANNING_KEY)).toEqual({
      chatIds,
      planJobId: 'whatsapp-history-plan-run-1-0',
    });
    expect(
      mocks.kvStore.get(
        'whatsapp-history-import-chat:connection-id:run-1:chat-0',
      ),
    ).toEqual(
      expect.objectContaining({
        status: 'IMPORTING',
        job: {
          kind: 'CONTACTS',
          payload: {
            ...PAYLOAD,
            chat: expect.objectContaining({ id: 'chat-0' }),
          },
        },
      }),
    );
    expect(
      mocks.kvStore.get(
        'whatsapp-history-import-chat:connection-id:run-1:chat-1',
      ),
    ).toEqual({
      status: 'PENDING',
      chat: expect.objectContaining({ id: 'chat-1' }),
    });
  });

  it('queues only the conversations the member selected, most recent first', async () => {
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

    await whatsappPlanHistoryImportHandler(PAYLOAD);

    expect(mocks.kvStore.get(PLANNING_KEY)).toEqual(
      expect.objectContaining({ chatIds: ['chat-1', 'chat-3', 'chat-old'] }),
    );
  });

  it('records a run with no conversations as fully listed', async () => {
    mockChatPages([0]);

    await expect(whatsappPlanHistoryImportHandler(PAYLOAD)).resolves.toEqual({
      status: 'PLANNED',
      conversationCount: 0,
    });
    expect(mocks.enqueueJobs).not.toHaveBeenCalled();
    expect(mocks.kvStore.get(PLANNING_KEY)).toEqual(
      expect.objectContaining({ chatIds: [] }),
    );
  });

  it('pauses the listing until the limit resets', async () => {
    vi.useFakeTimers({ now: Date.UTC(2026, 0, 1) });
    mocks.listUnipileChats.mockRejectedValue(
      new UnipileRateLimitError('Too many requests', 120),
    );

    await expect(whatsappPlanHistoryImportHandler(PAYLOAD)).resolves.toEqual({
      status: 'PAUSED',
    });
    expect(getEnqueueInputs()).toEqual([
      expect.objectContaining({
        delayMs: 120_000,
        jobs: [
          {
            jobId: 'whatsapp-history-plan-run-1-1',
            payload: { ...PAYLOAD, continuationIndex: 1 },
          },
        ],
      }),
    ]);
    expect(mocks.kvStore.get(PLANNING_KEY)).toEqual({
      planJobId: 'whatsapp-history-plan-run-1-1',
      resumeAt: '2026-01-01T00:02:00.000Z',
    });
    vi.useRealTimers();
  });

  it('does nothing once the run is cancelled', async () => {
    mocks.kvStore.set(STATE_KEY, { ...RUNNING_STATE, status: 'CANCELLED' });

    await expect(whatsappPlanHistoryImportHandler(PAYLOAD)).resolves.toEqual({
      status: 'CANCELLED',
    });
    expect(mocks.listUnipileChats).not.toHaveBeenCalled();
    expect(mocks.enqueueJobs).not.toHaveBeenCalled();
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
