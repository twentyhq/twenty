import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';

const mocks = vi.hoisted(() => ({
  getConnection: vi.fn(),
  listMessageChannels: vi.fn(),
  kvStore: new Map<string, unknown>(),
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
  kv: {
    get: async (key: string) => mocks.kvStore.get(key) ?? null,
    set: async (key: string, value: unknown) => {
      mocks.kvStore.set(key, value);
    },
  },
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
const CHUNK_KEY = 'linkedin-history-import-chunk:connection-id:run-1:2';

const RUNNING_STATE: LinkedinHistoryImportState = {
  runId: 'run-1',
  importPolicy: 'ALL',
  status: 'IMPORTING',
  importedConversationCount: 0,
  processedConversationCount: 0,
  totalConversationCount: 60,
  chunkCount: 3,
  startedAt: '2026-10-30T00:00:00.000Z',
};

const PAYLOAD = {
  connectedAccountId: 'connection-id',
  runId: 'run-1',
  chunkIndex: 2,
  chatIds: ['chat-1', 'chat-2'],
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
    mocks.getUnipileChat.mockImplementation(async ({ chatId }) => ({
      id: chatId,
      attendees: [],
    }));
    mocks.listUnipileChatMessages.mockResolvedValue([{ id: 'message' }]);
    mocks.ingestLinkedinMessages
      .mockResolvedValueOnce({
        ingestedMessageCount: 12,
        matchedPersonCount: 1,
        createdPersonCount: 1,
      })
      .mockResolvedValueOnce({
        ingestedMessageCount: 0,
        matchedPersonCount: 0,
        createdPersonCount: 0,
        skippedReason: 'NO_CONTACT',
      });
  });

  it('imports the chats of its chunk and stores how many were imported', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const result = await linkedinImportHistoryHandler(PAYLOAD);

    expect(mocks.ingestLinkedinMessages).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      status: 'COMPLETED',
      importedConversationCount: 1,
    });
    expect(mocks.kvStore.get(CHUNK_KEY)).toEqual({
      importedConversationCount: 1,
    });
    expect(
      mocks.kvStore.get(
        'linkedin-history-import-chunk-progress:connection-id:run-1:2',
      ),
    ).toBe(2);
    expect(log).toHaveBeenCalledWith(
      expect.stringMatching(
        /chunk 2: 2 chats .*1 conversations imported, 12 messages, 1 people matched, 1 people created, skipped 1 without contact/,
      ),
    );
  });

  it.each([
    ['a cancelled run', { ...RUNNING_STATE, status: 'CANCELLED' }],
    ['a newer run', { ...RUNNING_STATE, runId: 'run-2' }],
  ])('skips its chunk for %s', async (_, state) => {
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
    expect(mocks.kvStore.has(CHUNK_KEY)).toBe(false);
  });

  it('stores the error of a chunk Twenty will not retry', async () => {
    mocks.getUnipileChat.mockRejectedValue({
      status: 400,
      title: 'Invalid querystring',
    });

    await expect(
      linkedinImportHistoryHandler(PAYLOAD, { retryCount: 0, maxRetries: 3 }),
    ).rejects.toThrow('Invalid querystring');
    expect(mocks.kvStore.get(CHUNK_KEY)).toEqual({
      importedConversationCount: 0,
      error: { code: 'UNKNOWN', message: 'Invalid querystring' },
    });
  });
});
