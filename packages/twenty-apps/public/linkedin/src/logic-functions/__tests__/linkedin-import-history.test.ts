import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';

const mocks = vi.hoisted(() => ({
  getConnection: vi.fn(),
  listMessageChannels: vi.fn(),
  enqueueJobs: vi.fn(),
  kvStore: new Map<string, unknown>(),
  listUnipileChatMessagesPage: vi.fn(),
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

vi.mock('src/unipile/utils/list-unipile-chat-messages-page.util', () => ({
  listUnipileChatMessagesPage: mocks.listUnipileChatMessagesPage,
}));

vi.mock('src/unipile/utils/get-unipile-chat.util', () => ({
  getUnipileChat: mocks.getUnipileChat,
}));

vi.mock('src/logic-functions/utils/ingest-linkedin-messages.util', () => ({
  ingestLinkedinMessages: mocks.ingestLinkedinMessages,
}));

const { UnipileRateLimitError } =
  await import('src/unipile/utils/request-unipile.util');

const { linkedinImportHistoryHandler } =
  await import('src/logic-functions/linkedin-import-history');

const STATE_KEY = 'linkedin-history-import:connection-id';
const PROGRESS_KEY = 'linkedin-history-import-progress:connection-id:run-1';
const getChatsKey = (chunkIndex: number) =>
  `linkedin-history-import-chats:connection-id:run-1:${chunkIndex}`;

const RUNNING_STATE: LinkedinHistoryImportState = {
  runId: 'run-1',
  importPolicy: 'ALL',
  status: 'IMPORTING',
  importedConversationCount: 0,
  processedConversationCount: 0,
  startedAt: '2026-10-30T00:00:00.000Z',
};

const PROGRESS_BEFORE_CHUNK_2 = {
  completedChunkCount: 2,
  completedConversationCount: 40,
  importedConversationCount: 30,
  currentChunkProcessedCount: 0,
};

const PAYLOAD = {
  connectedAccountId: 'connection-id',
  runId: 'run-1',
  chunkIndex: 2,
};

const CURRENT_PROGRESS = {
  ...PROGRESS_BEFORE_CHUNK_2,
  currentJobId: 'linkedin-history-chunk-run-1-2',
  currentResumeIndex: undefined,
};

const LISTED_CHAT_WITH_ATTENDEE = {
  id: 'chat-1',
  user: { id: 'user-1', public_identifier: 'ada' },
};

const LISTED_CHAT_WITHOUT_ATTENDEE = { id: 'chat-2' };

const IMPORTED = {
  ingestedMessageCount: 12,
  matchedPersonCount: 1,
  createdPersonCount: 1,
  importedAttachmentCount: 2,
};

const SKIPPED = {
  ingestedMessageCount: 0,
  matchedPersonCount: 0,
  createdPersonCount: 0,
  importedAttachmentCount: 0,
  skippedReason: 'NO_CONTACT',
};

describe('linkedinImportHistoryHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    mocks.kvStore.clear();
    mocks.kvStore.set(STATE_KEY, RUNNING_STATE);
    mocks.kvStore.set(PROGRESS_KEY, PROGRESS_BEFORE_CHUNK_2);
    mocks.kvStore.set(getChatsKey(2), [
      LISTED_CHAT_WITH_ATTENDEE,
      LISTED_CHAT_WITHOUT_ATTENDEE,
    ]);
    mocks.getConnection.mockResolvedValue({ externalAccountId: 'acc_1' });
    mocks.listMessageChannels.mockResolvedValue([
      { id: 'channel-id', handle: 'linkedin.com/in/me' },
    ]);
    mocks.getUnipileChat.mockImplementation(async ({ chatId }) => ({
      id: chatId,
      user: { id: `user-${chatId}`, public_identifier: chatId },
    }));
    mocks.listUnipileChatMessagesPage
      .mockReset()
      .mockResolvedValue({ items: [{ id: 'message' }], nextCursor: undefined });
    mocks.ingestLinkedinMessages
      .mockReset()
      .mockResolvedValueOnce(IMPORTED)
      .mockResolvedValueOnce(SKIPPED);
  });

  it('imports its page and adds it to the run progress', async () => {
    await expect(linkedinImportHistoryHandler(PAYLOAD)).resolves.toEqual({
      status: 'COMPLETED',
      importedConversationCount: 1,
    });

    expect(mocks.getUnipileChat).toHaveBeenCalledExactlyOnceWith({
      accountId: 'acc_1',
      chatId: 'chat-2',
    });
    expect(mocks.ingestLinkedinMessages).toHaveBeenCalledWith(
      expect.objectContaining({ unipileAccountId: 'acc_1' }),
    );
    expect(mocks.kvStore.get(PROGRESS_KEY)).toEqual({
      completedChunkCount: 3,
      completedConversationCount: 42,
      importedConversationCount: 31,
      currentChunkProcessedCount: 0,
    });
    expect(console.log).toHaveBeenCalledWith(
      expect.stringMatching(
        /chunk 2: 2 chats .*1 conversations imported, 12 messages, 1 people matched, 1 people created, 2 attachments, skipped 1 without contact/,
      ),
    );
  });

  it('ingests a long chat page by page and records its cursor', async () => {
    mocks.listUnipileChatMessagesPage
      .mockReset()
      .mockResolvedValueOnce({ items: [{ id: 'm-1' }], nextCursor: 'page-2' })
      .mockImplementationOnce(async ({ cursor }) => {
        expect(cursor).toBe('page-2');
        expect(mocks.kvStore.get(PROGRESS_KEY)).toEqual({
          ...CURRENT_PROGRESS,
          currentChunkProcessedCount: 0,
          currentChunkImportedCount: 0,
          currentChatCursor: 'page-2',
          isCurrentChatImported: true,
        });

        return { items: [{ id: 'm-2' }], nextCursor: undefined };
      })
      .mockResolvedValue({ items: [{ id: 'm-3' }], nextCursor: undefined });
    mocks.ingestLinkedinMessages.mockReset().mockResolvedValue(IMPORTED);

    await linkedinImportHistoryHandler(PAYLOAD);

    expect(mocks.ingestLinkedinMessages).toHaveBeenCalledTimes(3);
    expect(mocks.kvStore.get(PROGRESS_KEY)).toEqual(
      expect.objectContaining({
        completedChunkCount: 3,
        importedConversationCount: 32,
      }),
    );
  });

  it('resumes a chat from the page a paused job stopped at', async () => {
    mocks.kvStore.set(PROGRESS_KEY, {
      ...PROGRESS_BEFORE_CHUNK_2,
      currentChatCursor: 'page-7',
      isCurrentChatImported: true,
    });
    mocks.ingestLinkedinMessages.mockReset().mockResolvedValue(SKIPPED);

    await linkedinImportHistoryHandler({ ...PAYLOAD, resumeIndex: 1 });

    expect(mocks.listUnipileChatMessagesPage).toHaveBeenNthCalledWith(1, {
      accountId: 'acc_1',
      chatId: 'chat-1',
      cursor: 'page-7',
    });
    expect(mocks.kvStore.get(PROGRESS_KEY)).toEqual(
      expect.objectContaining({ importedConversationCount: 31 }),
    );
  });

  it('hands over to a fresh job before its time runs out', async () => {
    vi.useFakeTimers({ now: 0 });
    mocks.listUnipileChatMessagesPage
      .mockReset()
      .mockImplementation(async () => {
        vi.setSystemTime(Date.now() + 11 * 60 * 1000);

        return { items: [{ id: 'message' }], nextCursor: 'page-2' };
      });

    await expect(linkedinImportHistoryHandler(PAYLOAD)).resolves.toEqual({
      status: 'PAUSED',
    });
    expect(mocks.enqueueJobs).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        jobs: [
          {
            jobId: 'linkedin-history-chunk-run-1-2-resume-1',
            payload: { ...PAYLOAD, resumeIndex: 1 },
          },
        ],
        delayMs: 0,
      }),
    );
    expect(mocks.kvStore.get(PROGRESS_KEY)).toEqual(
      expect.objectContaining({
        currentChatCursor: 'page-2',
        currentJobId: 'linkedin-history-chunk-run-1-2-resume-1',
        currentResumeIndex: 1,
      }),
    );
  });

  it('queues the next page once it is listed', async () => {
    mocks.kvStore.set(getChatsKey(3), [{ id: 'chat-3' }]);

    await linkedinImportHistoryHandler(PAYLOAD);

    expect(mocks.enqueueJobs).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        jobs: [
          {
            jobId: 'linkedin-history-chunk-run-1-3',
            payload: { ...PAYLOAD, chunkIndex: 3 },
          },
        ],
      }),
    );
  });

  it('leaves the next page to the planning job when it is not listed yet', async () => {
    await linkedinImportHistoryHandler(PAYLOAD);

    expect(mocks.enqueueJobs).not.toHaveBeenCalled();
  });

  it('only hands over to the next page when retried after finishing its own', async () => {
    mocks.kvStore.set(PROGRESS_KEY, {
      ...PROGRESS_BEFORE_CHUNK_2,
      completedChunkCount: 3,
    });
    mocks.kvStore.set(getChatsKey(3), [{ id: 'chat-3' }]);

    await expect(linkedinImportHistoryHandler(PAYLOAD)).resolves.toEqual({
      status: 'SKIPPED',
    });
    expect(mocks.ingestLinkedinMessages).not.toHaveBeenCalled();
    expect(mocks.enqueueJobs).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        jobs: [
          expect.objectContaining({ jobId: 'linkedin-history-chunk-run-1-3' }),
        ],
      }),
    );
  });

  it('skips a page that is not next in line', async () => {
    mocks.kvStore.set(PROGRESS_KEY, {
      ...PROGRESS_BEFORE_CHUNK_2,
      completedChunkCount: 1,
    });

    await expect(linkedinImportHistoryHandler(PAYLOAD)).resolves.toEqual({
      status: 'SKIPPED',
    });
    expect(mocks.ingestLinkedinMessages).not.toHaveBeenCalled();
  });

  it.each([
    ['a cancelled run', { ...RUNNING_STATE, status: 'CANCELLED' }],
    ['a newer run', { ...RUNNING_STATE, runId: 'run-2' }],
  ])('skips its page for %s', async (_, state) => {
    mocks.kvStore.set(STATE_KEY, state);

    await expect(linkedinImportHistoryHandler(PAYLOAD)).resolves.toEqual({
      status: 'CANCELLED',
    });
    expect(mocks.ingestLinkedinMessages).not.toHaveBeenCalled();
  });

  it('asks Twenty to retry when LinkedIn is unreachable', async () => {
    mocks.getUnipileChat.mockRejectedValue({ status: 503, title: 'Busy' });

    await expect(
      linkedinImportHistoryHandler(PAYLOAD, { retryCount: 0, maxRetries: 3 }),
    ).rejects.toSatisfy(
      (error: Error) =>
        error.constructor.name === 'RetryableLogicFunctionError',
    );
    expect(mocks.kvStore.get(PROGRESS_KEY)).not.toHaveProperty('error');
  });

  it('stores the error of a page Twenty will not retry', async () => {
    mocks.getUnipileChat.mockRejectedValue({
      status: 400,
      title: 'Invalid querystring',
    });

    await expect(
      linkedinImportHistoryHandler(PAYLOAD, { retryCount: 0, maxRetries: 3 }),
    ).rejects.toThrow('Invalid querystring');
    expect(mocks.kvStore.get(PROGRESS_KEY)).toEqual({
      ...CURRENT_PROGRESS,
      currentChunkProcessedCount: 1,
      currentChunkImportedCount: 1,
      isCurrentChatImported: false,
      currentChatCursor: undefined,
      error: { code: 'UNKNOWN', message: 'Invalid querystring' },
    });
  });

  it('pauses until the limit resets when LinkedIn refuses for hours', async () => {
    vi.useFakeTimers({ now: Date.parse('2026-10-30T22:00:00.000Z') });
    mocks.listUnipileChatMessagesPage
      .mockReset()
      .mockResolvedValueOnce({
        items: [{ id: 'message' }],
        nextCursor: undefined,
      })
      .mockRejectedValueOnce(
        new UnipileRateLimitError(
          'Unipile list chat messages failed (429): We only allow 100 requests. Retry in 22 hours.',
          22 * 60 * 60 + 1,
        ),
      );

    await expect(linkedinImportHistoryHandler(PAYLOAD)).resolves.toEqual({
      status: 'PAUSED',
    });

    expect(mocks.enqueueJobs).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        jobs: [
          {
            jobId: 'linkedin-history-chunk-run-1-2-resume-1',
            payload: { ...PAYLOAD, resumeIndex: 1 },
          },
        ],
        delayMs: (22 * 60 * 60 + 1) * 1000,
      }),
    );
    expect(mocks.kvStore.get(PROGRESS_KEY)).toEqual({
      ...CURRENT_PROGRESS,
      currentChunkProcessedCount: 1,
      currentChunkImportedCount: 1,
      isCurrentChatImported: false,
      currentChatCursor: undefined,
      currentJobId: 'linkedin-history-chunk-run-1-2-resume-1',
      currentResumeIndex: 1,
      resumeAt: '2026-10-31T20:00:01.000Z',
    });
  });

  it('resumes after the chats a paused job already imported', async () => {
    mocks.kvStore.set(PROGRESS_KEY, {
      ...PROGRESS_BEFORE_CHUNK_2,
      currentChunkProcessedCount: 1,
      currentChunkImportedCount: 1,
    });
    mocks.ingestLinkedinMessages.mockReset().mockResolvedValue({
      ingestedMessageCount: 3,
      matchedPersonCount: 1,
      createdPersonCount: 0,
      importedAttachmentCount: 0,
    });

    await linkedinImportHistoryHandler({ ...PAYLOAD, resumeIndex: 1 });

    expect(mocks.ingestLinkedinMessages).toHaveBeenCalledTimes(1);
    expect(mocks.kvStore.get(PROGRESS_KEY)).toEqual({
      completedChunkCount: 3,
      completedConversationCount: 42,
      importedConversationCount: 32,
      currentChunkProcessedCount: 0,
    });
  });
});
