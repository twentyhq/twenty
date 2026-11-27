import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';

const mocks = vi.hoisted(() => ({
  getConnection: vi.fn(),
  listMessageChannels: vi.fn(),
  enqueueJobs: vi.fn(),
  kvStore: new Map<string, unknown>(),
  listUnipileChatMessagesPage: vi.fn(),
  ingestLinkedinChatMessages: vi.fn(),
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

vi.mock('src/unipile/utils/list-unipile-chat-messages-page.util', () => ({
  listUnipileChatMessagesPage: mocks.listUnipileChatMessagesPage,
}));

vi.mock('src/logic-functions/utils/ingest-linkedin-messages.util', () => ({
  ingestLinkedinChatMessages: mocks.ingestLinkedinChatMessages,
}));

const { UnipileRateLimitError, UnipileRequestError } =
  await import('src/unipile/utils/request-unipile.util');

const { linkedinImportChatMessagesHandler } =
  await import('src/logic-functions/linkedin-import-chat-messages');

const STATE_KEY = 'linkedin-history-import:connection-id';
const CHAT_KEY = 'linkedin-history-import-chat:connection-id:run-1:chat-1';

const RUNNING_STATE: LinkedinHistoryImportState = {
  runId: 'run-1',
  importPolicy: 'ALL',
  status: 'IMPORTING',
  importedConversationCount: 0,
  processedConversationCount: 0,
  startedAt: '2026-10-30T00:00:00.000Z',
};

const ADA = {
  id: 'user-1',
  display_name: 'Ada Lovelace',
  public_identifier: 'ada',
};

const PAYLOAD = {
  connectedAccountId: 'connection-id',
  runId: 'run-1',
  chat: {
    id: 'chat-1',
    name: 'Ada Lovelace',
    is_group: false,
    is_1to1: true,
    user: ADA,
  },
  counterparts: [ADA],
  personIdByHandle: { 'linkedin.com/in/ada': 'person-ada' },
  pageIndex: 0,
};

const getEnqueueInputs = () =>
  mocks.enqueueJobs.mock.calls.map(([input]) => input);

describe('linkedinImportChatMessagesHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    mocks.kvStore.clear();
    mocks.kvStore.set(STATE_KEY, RUNNING_STATE);
    mocks.getConnection.mockResolvedValue({ externalAccountId: 'acc_1' });
    mocks.listMessageChannels.mockResolvedValue([
      { id: 'channel-id', handle: 'linkedin.com/in/me' },
    ]);
    mocks.listUnipileChatMessagesPage.mockResolvedValue({
      items: [{ id: 'message-1' }, { id: 'message-2' }],
      nextCursor: 'cursor-1',
    });
    mocks.ingestLinkedinChatMessages.mockResolvedValue({
      ingestedMessageCount: 2,
      importedAttachmentCount: 0,
    });
  });

  it('imports one page with the people found for the conversation and queues the next page', async () => {
    await expect(linkedinImportChatMessagesHandler(PAYLOAD)).resolves.toEqual({
      status: 'CONTINUED',
    });

    expect(mocks.listUnipileChatMessagesPage).toHaveBeenCalledWith({
      accountId: 'acc_1',
      chatId: 'chat-1',
      cursor: undefined,
    });
    expect(mocks.ingestLinkedinChatMessages).toHaveBeenCalledWith(
      expect.objectContaining({
        counterparts: [ADA],
        personIdByHandle: new Map([['linkedin.com/in/ada', 'person-ada']]),
        messages: [{ id: 'message-1' }, { id: 'message-2' }],
      }),
    );

    const nextPayload = {
      ...PAYLOAD,
      cursor: 'cursor-1',
      pageIndex: 1,
      hasImportedMessages: true,
      attempt: undefined,
    };

    expect(getEnqueueInputs()).toEqual([
      expect.objectContaining({
        limiter: { max: 30, durationMs: 60_000 },
        jobs: [
          {
            jobId: 'linkedin-history-messages-run-1-chat-1-1-0',
            payload: nextPayload,
          },
        ],
      }),
    ]);
    expect(mocks.kvStore.get(CHAT_KEY)).toEqual({
      status: 'IMPORTING',
      job: { kind: 'MESSAGES', payload: nextPayload },
    });
  });

  it('marks the conversation imported after its last page', async () => {
    mocks.listUnipileChatMessagesPage.mockResolvedValue({
      items: [{ id: 'message-3' }],
    });
    mocks.ingestLinkedinChatMessages.mockResolvedValue({
      ingestedMessageCount: 0,
      importedAttachmentCount: 0,
    });

    await expect(
      linkedinImportChatMessagesHandler({
        ...PAYLOAD,
        cursor: 'cursor-1',
        pageIndex: 1,
        hasImportedMessages: true,
      }),
    ).resolves.toEqual({ status: 'COMPLETED' });
    expect(mocks.enqueueJobs).not.toHaveBeenCalled();
    expect(mocks.kvStore.get(CHAT_KEY)).toEqual({ status: 'IMPORTED' });
  });

  it('marks a conversation without any message to import as skipped', async () => {
    mocks.listUnipileChatMessagesPage.mockResolvedValue({ items: [] });
    mocks.ingestLinkedinChatMessages.mockResolvedValue({
      ingestedMessageCount: 0,
      importedAttachmentCount: 0,
    });

    await linkedinImportChatMessagesHandler(PAYLOAD);

    expect(mocks.kvStore.get(CHAT_KEY)).toEqual({ status: 'SKIPPED' });
  });

  it('stops when Unipile returns the cursor it was given', async () => {
    mocks.listUnipileChatMessagesPage.mockResolvedValue({
      items: [{ id: 'message-1' }],
      nextCursor: 'cursor-1',
    });

    await expect(
      linkedinImportChatMessagesHandler({
        ...PAYLOAD,
        cursor: 'cursor-1',
        pageIndex: 1,
      }),
    ).resolves.toEqual({ status: 'COMPLETED' });
    expect(mocks.enqueueJobs).not.toHaveBeenCalled();
  });

  it('retries the same page once the rate limit resets', async () => {
    vi.useFakeTimers({ now: Date.UTC(2026, 0, 1) });
    mocks.listUnipileChatMessagesPage.mockRejectedValue(
      new UnipileRateLimitError('Too many requests', 90),
    );

    await expect(
      linkedinImportChatMessagesHandler({
        ...PAYLOAD,
        cursor: 'cursor-2',
        pageIndex: 2,
      }),
    ).resolves.toEqual({ status: 'PAUSED' });

    const [enqueueInput] = getEnqueueInputs();

    expect(enqueueInput.delayMs).toBe(90_000);
    expect(enqueueInput.jobs).toEqual([
      {
        jobId: 'linkedin-history-messages-run-1-chat-1-2-1',
        payload: { ...PAYLOAD, cursor: 'cursor-2', pageIndex: 2, attempt: 1 },
      },
    ]);
    expect(mocks.kvStore.get(CHAT_KEY)).toEqual(
      expect.objectContaining({ resumeAt: '2026-01-01T00:01:30.000Z' }),
    );
  });

  it('lets Twenty retry while LinkedIn is unreachable', async () => {
    mocks.listUnipileChatMessagesPage.mockRejectedValue(
      new UnipileRequestError('list chat messages failed', 503),
    );

    await expect(
      linkedinImportChatMessagesHandler(PAYLOAD, {
        retryCount: 0,
        maxRetries: 3,
      }),
    ).rejects.toThrow('list chat messages failed');
    expect(mocks.kvStore.get(CHAT_KEY)).toBeUndefined();
  });

  it('drops a chunk job queued by the previous version of the import', async () => {
    const legacyPayload: Record<string, unknown> = {
      connectedAccountId: 'connection-id',
      runId: 'run-1',
      chunkIndex: 2,
    };

    await expect(
      linkedinImportChatMessagesHandler(
        legacyPayload as unknown as Parameters<
          typeof linkedinImportChatMessagesHandler
        >[0],
      ),
    ).resolves.toEqual({ status: 'CANCELLED' });
    expect(mocks.listUnipileChatMessagesPage).not.toHaveBeenCalled();
  });

  it('does nothing once the run is cancelled', async () => {
    mocks.kvStore.set(STATE_KEY, { ...RUNNING_STATE, status: 'CANCELLED' });

    await expect(linkedinImportChatMessagesHandler(PAYLOAD)).resolves.toEqual({
      status: 'CANCELLED',
    });
    expect(mocks.listUnipileChatMessagesPage).not.toHaveBeenCalled();
  });
});
