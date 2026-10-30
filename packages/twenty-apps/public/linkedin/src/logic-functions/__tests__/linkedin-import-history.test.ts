import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';

const mocks = vi.hoisted(() => ({
  getConnection: vi.fn(),
  listMessageChannels: vi.fn(),
  enqueueJobs: vi.fn(),
  kvStore: new Map<string, unknown>(),
  listUnipileChats: vi.fn(),
  listUnipileChatMessages: vi.fn(),
  getUnipileChat: vi.fn(),
  ingestLinkedinMessages: vi.fn(),
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

vi.mock('src/unipile/utils/list-unipile-chat-messages.util', () => ({
  listUnipileChatMessages: mocks.listUnipileChatMessages,
}));

vi.mock('src/unipile/utils/get-unipile-chat.util', () => ({
  getUnipileChat: mocks.getUnipileChat,
}));

vi.mock('src/logic-functions/utils/ingest-linkedin-messages.util', () => ({
  ingestLinkedinMessages: mocks.ingestLinkedinMessages,
}));

const { linkedinImportHistoryHandler } =
  await import('src/logic-functions/linkedin-import-history');

const STATE_KEY = 'linkedin-history-import:connection-id';

const RUNNING_STATE: LinkedinHistoryImportState = {
  runId: 'run-1',
  importPolicy: 'ALL',
  status: 'IMPORTING',
  importedConversationCount: 3,
  processedConversationCount: 3,
  startedAt: '2026-10-30T00:00:00.000Z',
};

const buildChat = (id: string, lastMessageAt: string) => ({
  id,
  name: id,
  is_group: false,
  is_1to1: true,
  last_message_timestamp: lastMessageAt,
  user: { id: `user-${id}`, display_name: id, public_identifier: id },
});

const PAYLOAD = {
  connectedAccountId: 'connection-id',
  runId: 'run-1',
  pageIndex: 0,
};

describe('linkedinImportHistoryHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.kvStore.clear();
    mocks.kvStore.set(STATE_KEY, RUNNING_STATE);
    mocks.getConnection.mockResolvedValue({ externalAccountId: 'acc_1' });
    mocks.listMessageChannels.mockResolvedValue([
      { id: 'channel-id', handle: 'linkedin.com/in/me' },
    ]);
    mocks.listUnipileChatMessages.mockResolvedValue([{ id: 'message' }]);
    mocks.ingestLinkedinMessages.mockResolvedValue(1);
  });

  it('imports a full page and queues the next one', async () => {
    mocks.listUnipileChats.mockResolvedValue({
      items: [buildChat('recent', '2026-10-29T00:00:00.000Z')],
      nextCursor: 'cursor-2',
      totalCount: 40,
    });

    await expect(linkedinImportHistoryHandler(PAYLOAD)).resolves.toEqual({
      status: 'CONTINUED',
      importedConversationCount: 4,
    });
    expect(mocks.kvStore.get(STATE_KEY)).toEqual(
      expect.objectContaining({
        processedConversationCount: 4,
        totalConversationCount: 40,
      }),
    );
    expect(mocks.listUnipileChatMessages).toHaveBeenCalledExactlyOnceWith({
      accountId: 'acc_1',
      chatId: 'recent',
    });
    expect(mocks.enqueueJobs).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        jobs: [
          {
            jobId: 'linkedin-import-history-run-1-1',
            payload: { ...PAYLOAD, pageIndex: 1, cursor: 'cursor-2' },
          },
        ],
      }),
    );
  });

  it('completes the run on the last page', async () => {
    mocks.listUnipileChats.mockResolvedValue({
      items: [buildChat('old', '2024-08-01T00:00:00.000Z')],
      nextCursor: undefined,
    });

    await expect(linkedinImportHistoryHandler(PAYLOAD)).resolves.toEqual({
      status: 'COMPLETED',
      importedConversationCount: 4,
    });
    expect(mocks.enqueueJobs).not.toHaveBeenCalled();
    expect(mocks.kvStore.get(STATE_KEY)).toEqual(
      expect.objectContaining({ status: 'COMPLETED' }),
    );
  });

  it('counts the chats first when LinkedIn returns no total', async () => {
    mocks.listUnipileChats.mockResolvedValue({
      items: [buildChat('recent', '2026-10-29T00:00:00.000Z')],
      nextCursor: undefined,
    });

    await linkedinImportHistoryHandler(PAYLOAD);

    expect(mocks.listUnipileChats).toHaveBeenCalledTimes(2);
    expect(mocks.kvStore.get(STATE_KEY)).toEqual(
      expect.objectContaining({ totalConversationCount: 1 }),
    );
  });

  it('fetches the attendees of a chat the list did not embed them in', async () => {
    const { user: _user, ...chatWithoutAttendees } = buildChat(
      'bare',
      '2026-10-29T00:00:00.000Z',
    );

    mocks.listUnipileChats.mockResolvedValue({
      items: [chatWithoutAttendees],
      nextCursor: undefined,
    });
    mocks.getUnipileChat.mockResolvedValue(
      buildChat('bare', '2026-10-29T00:00:00.000Z'),
    );

    await linkedinImportHistoryHandler(PAYLOAD);

    expect(mocks.getUnipileChat).toHaveBeenCalledExactlyOnceWith({
      accountId: 'acc_1',
      chatId: 'bare',
    });
  });

  it('ignores pages of a superseded run', async () => {
    await expect(
      linkedinImportHistoryHandler({ ...PAYLOAD, runId: 'run-0' }),
    ).resolves.toEqual({ status: 'SUPERSEDED' });
    expect(mocks.listUnipileChats).not.toHaveBeenCalled();
  });

  it('closes the run as failed on an error Twenty will not retry', async () => {
    mocks.listUnipileChats.mockRejectedValue({
      status: 422,
      title: 'Invalid cursor',
    });

    await expect(
      linkedinImportHistoryHandler(PAYLOAD, { retryCount: 0, maxRetries: 3 }),
    ).rejects.toEqual({ status: 422, title: 'Invalid cursor' });
    expect(mocks.kvStore.get(STATE_KEY)).toEqual(
      expect.objectContaining({
        status: 'FAILED',
        error: { code: 'UNKNOWN', message: 'Invalid cursor' },
      }),
    );
  });

  it('asks Twenty to retry when Unipile is unreachable and retries are left', async () => {
    mocks.listUnipileChats.mockRejectedValue({
      status: 503,
      title: 'Service unavailable',
    });

    await expect(
      linkedinImportHistoryHandler(PAYLOAD, { retryCount: 1, maxRetries: 3 }),
    ).rejects.toThrow('Service unavailable');
    expect(mocks.kvStore.get(STATE_KEY)).toEqual(
      expect.objectContaining({ status: 'IMPORTING' }),
    );
  });

  it('closes the run once Unipile stays unreachable on the last retry', async () => {
    mocks.listUnipileChats.mockRejectedValue({
      status: 503,
      title: 'Service unavailable',
    });

    await expect(
      linkedinImportHistoryHandler(PAYLOAD, { retryCount: 3, maxRetries: 3 }),
    ).rejects.toBeDefined();
    expect(mocks.kvStore.get(STATE_KEY)).toEqual(
      expect.objectContaining({
        status: 'FAILED',
        error: { code: 'UNREACHABLE', message: 'Service unavailable' },
      }),
    );
  });
});
