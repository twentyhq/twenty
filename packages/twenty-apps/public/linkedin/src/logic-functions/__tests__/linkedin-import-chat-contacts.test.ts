import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';

const mocks = vi.hoisted(() => ({
  getConnection: vi.fn(),
  enqueueJobs: vi.fn(),
  kvStore: new Map<string, unknown>(),
  getUnipileChatIfExists: vi.fn(),
  listUnipileChatMessagesPage: vi.fn(),
  resolveLinkedinChatPersons: vi.fn(),
  setLinkedinChatPersonAvatars: vi.fn(),
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

vi.mock('src/unipile/utils/get-unipile-chat-if-exists.util', () => ({
  getUnipileChatIfExists: mocks.getUnipileChatIfExists,
}));

vi.mock('src/unipile/utils/list-unipile-chat-messages-page.util', () => ({
  listUnipileChatMessagesPage: mocks.listUnipileChatMessagesPage,
}));

vi.mock('src/logic-functions/utils/ingest-linkedin-messages.util', () => ({
  resolveLinkedinChatPersons: mocks.resolveLinkedinChatPersons,
  setLinkedinChatPersonAvatars: mocks.setLinkedinChatPersonAvatars,
}));

const { UnipileRateLimitError } =
  await import('src/unipile/utils/request-unipile.util');

const { linkedinImportChatContactsHandler } =
  await import('src/logic-functions/linkedin-import-chat-contacts');

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

const ADA = { id: 'user-1', display_name: 'Ada Lovelace' };

const RESOLVED_ADA = { ...ADA, public_identifier: 'ada' };

const CHAT = {
  id: 'chat-1',
  name: 'Ada Lovelace',
  is_group: false,
  is_1to1: true,
  user: ADA,
};

const PAYLOAD = {
  connectedAccountId: 'connection-id',
  runId: 'run-1',
  chat: CHAT,
};

const getEnqueueInputs = () =>
  mocks.enqueueJobs.mock.calls.map(([input]) => input);

describe('linkedinImportChatContactsHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    mocks.kvStore.clear();
    mocks.kvStore.set(STATE_KEY, RUNNING_STATE);
    mocks.getConnection.mockResolvedValue({ externalAccountId: 'acc_1' });
    mocks.resolveLinkedinChatPersons.mockResolvedValue({
      counterparts: [RESOLVED_ADA],
      personIdByHandle: new Map([['linkedin.com/in/ada', 'person-ada']]),
      matchedPersonCount: 0,
      createdPersonCount: 1,
    });
  });

  it('queues the import of the messages once the conversation has a person', async () => {
    await expect(linkedinImportChatContactsHandler(PAYLOAD)).resolves.toEqual({
      status: 'CONTINUED',
    });

    const messagesJob = {
      kind: 'MESSAGES',
      payload: {
        ...PAYLOAD,
        counterparts: [RESOLVED_ADA],
        personIdByHandle: { 'linkedin.com/in/ada': 'person-ada' },
        pageIndex: 0,
      },
    };

    expect(getEnqueueInputs()).toEqual([
      expect.objectContaining({
        limiter: { max: 30, durationMs: 60_000 },
        jobs: [
          {
            jobId: 'linkedin-history-messages-run-1-chat-1-0-0',
            payload: messagesJob.payload,
          },
        ],
      }),
    ]);
    expect(mocks.kvStore.get(CHAT_KEY)).toEqual({
      status: 'IMPORTING',
      job: messagesJob,
    });
    expect(mocks.setLinkedinChatPersonAvatars).toHaveBeenCalledWith(
      expect.objectContaining({ counterparts: [RESOLVED_ADA] }),
    );
  });

  it('skips the conversation when no person is matched or created', async () => {
    mocks.resolveLinkedinChatPersons.mockResolvedValue({
      counterparts: [RESOLVED_ADA],
      personIdByHandle: new Map(),
      matchedPersonCount: 0,
      createdPersonCount: 0,
    });

    await expect(linkedinImportChatContactsHandler(PAYLOAD)).resolves.toEqual({
      status: 'SKIPPED',
    });
    expect(mocks.enqueueJobs).not.toHaveBeenCalled();
    expect(mocks.kvStore.get(CHAT_KEY)).toEqual({ status: 'SKIPPED' });
  });

  it('skips a conversation the member did not select without calling LinkedIn', async () => {
    mocks.kvStore.set('linkedin-settings:connection-id', {
      importPolicy: 'SELECTED',
      selectedChats: [{ id: 'chat-other', name: 'Other' }],
    });

    await expect(linkedinImportChatContactsHandler(PAYLOAD)).resolves.toEqual({
      status: 'SKIPPED',
    });
    expect(mocks.resolveLinkedinChatPersons).not.toHaveBeenCalled();
    expect(mocks.getUnipileChatIfExists).not.toHaveBeenCalled();
  });

  it('reads the latest messages only when it must know whether the member wrote', async () => {
    mocks.listUnipileChatMessagesPage.mockResolvedValue({
      items: [{ id: 'message-1', is_sender: true }],
    });

    await linkedinImportChatContactsHandler(PAYLOAD);

    expect(mocks.listUnipileChatMessagesPage).not.toHaveBeenCalled();

    const [{ hasUserSentMessage }] =
      mocks.resolveLinkedinChatPersons.mock.calls[0];

    await expect(hasUserSentMessage()).resolves.toBe(true);
    expect(mocks.listUnipileChatMessagesPage).toHaveBeenCalledWith({
      accountId: 'acc_1',
      chatId: 'chat-1',
    });
  });

  it('fetches a listed conversation that came without its participants', async () => {
    mocks.getUnipileChatIfExists.mockResolvedValueOnce(CHAT);

    await linkedinImportChatContactsHandler({
      ...PAYLOAD,
      chat: { ...CHAT, user: undefined },
    });

    expect(mocks.resolveLinkedinChatPersons).toHaveBeenCalledWith(
      expect.objectContaining({ counterparts: [ADA] }),
    );
  });

  it('skips a conversation that no longer exists', async () => {
    mocks.getUnipileChatIfExists.mockResolvedValueOnce(undefined);

    await expect(
      linkedinImportChatContactsHandler({
        ...PAYLOAD,
        chat: { ...CHAT, user: undefined },
      }),
    ).resolves.toEqual({ status: 'SKIPPED' });
    expect(mocks.kvStore.get(CHAT_KEY)).toEqual({ status: 'SKIPPED' });
  });

  it('waits for the daily profile lookups to reset', async () => {
    vi.useFakeTimers({ now: Date.UTC(2026, 0, 1) });
    mocks.resolveLinkedinChatPersons.mockRejectedValue(
      new UnipileRateLimitError('used its 60 profile lookups of the day', 3600),
    );

    await expect(linkedinImportChatContactsHandler(PAYLOAD)).resolves.toEqual({
      status: 'PAUSED',
    });

    const [enqueueInput] = getEnqueueInputs();

    expect(enqueueInput.delayMs).toBe(3_600_000);
    expect(enqueueInput.limiter).toBeUndefined();
    expect(enqueueInput.jobs[0].jobId).toBe(
      'linkedin-history-contacts-run-1-chat-1-1',
    );
    expect(mocks.kvStore.get(CHAT_KEY)).toEqual(
      expect.objectContaining({
        status: 'IMPORTING',
        resumeAt: '2026-01-01T01:00:00.000Z',
      }),
    );
  });

  it('marks the conversation as failed on an error Twenty will not retry', async () => {
    mocks.resolveLinkedinChatPersons.mockRejectedValue(new Error('Boom'));

    await expect(
      linkedinImportChatContactsHandler(PAYLOAD, {
        retryCount: 3,
        maxRetries: 3,
      }),
    ).rejects.toThrow('Boom');
    expect(mocks.kvStore.get(CHAT_KEY)).toEqual({
      status: 'FAILED',
      error: { code: 'UNKNOWN', message: 'Boom' },
    });
  });

  it('does nothing once the run is cancelled', async () => {
    mocks.kvStore.set(STATE_KEY, { ...RUNNING_STATE, status: 'CANCELLED' });

    await expect(linkedinImportChatContactsHandler(PAYLOAD)).resolves.toEqual({
      status: 'CANCELLED',
    });
    expect(mocks.resolveLinkedinChatPersons).not.toHaveBeenCalled();
  });
});
