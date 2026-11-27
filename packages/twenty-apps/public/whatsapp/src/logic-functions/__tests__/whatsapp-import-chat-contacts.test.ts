import { beforeEach, describe, expect, it, vi } from 'vitest';

import type * as IngestWhatsappMessagesUtil from 'src/logic-functions/utils/ingest-whatsapp-messages.util';
import { type WhatsappHistoryImportState } from 'src/types/whatsapp-history-import-state.type';

type IngestWhatsappMessagesModule = typeof IngestWhatsappMessagesUtil;
import { getWhatsappChatJobIdSegment } from 'src/logic-functions/utils/get-whatsapp-history-import-job-id.util';

const mocks = vi.hoisted(() => ({
  getConnection: vi.fn(),
  listMessageChannels: vi.fn(),
  enqueueJobs: vi.fn(),
  kvStore: new Map<string, unknown>(),
  getUnipileChatIfExists: vi.fn(),
  listUnipileChatMessagesPage: vi.fn(),
  resolveWhatsappChatPersons: vi.fn(),
  setWhatsappChatPersonAvatars: vi.fn(),
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

vi.mock('src/unipile/utils/get-unipile-chat-if-exists.util', () => ({
  getUnipileChatIfExists: mocks.getUnipileChatIfExists,
}));

vi.mock('src/unipile/utils/list-unipile-chat-messages-page.util', () => ({
  listUnipileChatMessagesPage: mocks.listUnipileChatMessagesPage,
}));

vi.mock(
  'src/logic-functions/utils/ingest-whatsapp-messages.util',
  async (importOriginal) => ({
    mapWhatsappMessages: (await importOriginal<IngestWhatsappMessagesModule>())
      .mapWhatsappMessages,
    resolveWhatsappChatPersons: mocks.resolveWhatsappChatPersons,
    setWhatsappChatPersonAvatars: mocks.setWhatsappChatPersonAvatars,
  }),
);

const { UnipileRateLimitError } =
  await import('src/unipile/utils/request-unipile.util');

const { whatsappImportChatContactsHandler } =
  await import('src/logic-functions/whatsapp-import-chat-contacts');

const STATE_KEY = 'whatsapp-history-import:connection-id';
const CHAT_KEY = 'whatsapp-history-import-chat:connection-id:run-1:chat-1';
const NEXT_CHAT_KEY = 'whatsapp-history-import-chat:connection-id:run-1:chat-2';
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

const ADA = {
  id: '33611111111@s.whatsapp.net',
  display_name: 'Ada Lovelace',
};

const ADA_HANDLE = '+33611111111';

const ADA_COUNTERPART = { user: ADA, handle: ADA_HANDLE };

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

describe('whatsappImportChatContactsHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    mocks.kvStore.clear();
    mocks.kvStore.set(STATE_KEY, RUNNING_STATE);
    mocks.kvStore.set(PLANNING_KEY, { chatIds: ['chat-1', 'chat-2'] });
    mocks.kvStore.set(NEXT_CHAT_KEY, {
      status: 'PENDING',
      chat: { ...CHAT, id: 'chat-2' },
    });
    mocks.getConnection.mockResolvedValue({ externalAccountId: 'acc_1' });
    mocks.listMessageChannels.mockResolvedValue([
      { id: 'channel-id', handle: '+33600000000' },
    ]);
    mocks.resolveWhatsappChatPersons.mockResolvedValue({
      personIdByHandle: new Map([[ADA_HANDLE, 'person-ada']]),
      matchedPersonCount: 0,
      createdPersonCount: 1,
    });
  });

  it('queues the import of the messages once the conversation has a person', async () => {
    await expect(whatsappImportChatContactsHandler(PAYLOAD)).resolves.toEqual({
      status: 'CONTINUED',
    });

    const messagesJob = {
      kind: 'MESSAGES',
      payload: {
        ...PAYLOAD,
        counterparts: [ADA_COUNTERPART],
        personIdByHandle: { [ADA_HANDLE]: 'person-ada' },
        pageIndex: 0,
      },
    };

    expect(getEnqueueInputs()).toEqual([
      expect.objectContaining({
        jobs: [
          expect.objectContaining({
            jobId: `whatsapp-history-contacts-run-1-${getWhatsappChatJobIdSegment('chat-2')}-0`,
          }),
        ],
      }),
      expect.objectContaining({
        limiter: { max: 30, durationMs: 60_000 },
        jobs: [
          {
            jobId: `whatsapp-history-messages-run-1-${getWhatsappChatJobIdSegment('chat-1')}-0-0`,
            payload: messagesJob.payload,
          },
        ],
      }),
    ]);
    expect(mocks.kvStore.get(CHAT_KEY)).toEqual({
      status: 'IMPORTING',
      job: messagesJob,
    });
    expect(mocks.setWhatsappChatPersonAvatars).toHaveBeenCalledWith(
      expect.objectContaining({ counterparts: [ADA_COUNTERPART] }),
    );
  });

  it('skips the conversation when no person is matched or created', async () => {
    mocks.resolveWhatsappChatPersons.mockResolvedValue({
      personIdByHandle: new Map(),
      matchedPersonCount: 0,
      createdPersonCount: 0,
    });

    await expect(whatsappImportChatContactsHandler(PAYLOAD)).resolves.toEqual({
      status: 'SKIPPED',
    });
    expect(
      getEnqueueInputs().flatMap((input) =>
        input.jobs.map((job: { jobId: string }) => job.jobId),
      ),
    ).toEqual([
      `whatsapp-history-contacts-run-1-${getWhatsappChatJobIdSegment('chat-2')}-0`,
    ]);
    expect(mocks.kvStore.get(CHAT_KEY)).toEqual({ status: 'SKIPPED' });
    expect(mocks.kvStore.get(NEXT_CHAT_KEY)).toEqual(
      expect.objectContaining({ status: 'IMPORTING' }),
    );
  });

  it('skips a conversation the member did not select without calling WhatsApp', async () => {
    mocks.kvStore.set('whatsapp-settings:connection-id', {
      importPolicy: 'SELECTED',
      selectedChats: [{ id: 'chat-other', name: 'Other' }],
    });

    await expect(whatsappImportChatContactsHandler(PAYLOAD)).resolves.toEqual({
      status: 'SKIPPED',
    });
    expect(mocks.resolveWhatsappChatPersons).not.toHaveBeenCalled();
    expect(mocks.getUnipileChatIfExists).not.toHaveBeenCalled();
  });

  it('reads the latest messages only when it must know whether the member wrote', async () => {
    mocks.listUnipileChatMessagesPage.mockResolvedValue({
      items: [
        {
          id: 'message-1',
          chat_id: 'chat-1',
          is_sender: true,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      ],
    });

    await whatsappImportChatContactsHandler(PAYLOAD);

    expect(mocks.listUnipileChatMessagesPage).not.toHaveBeenCalled();

    const [{ hasUserSentMessage }] =
      mocks.resolveWhatsappChatPersons.mock.calls[0];

    await expect(hasUserSentMessage()).resolves.toBe(true);
    expect(mocks.listUnipileChatMessagesPage).toHaveBeenCalledWith({
      accountId: 'acc_1',
      chatId: 'chat-1',
    });
  });

  it.each([
    ['an event', { id: 'message-1', is_sender: true, is_event: true }],
    [
      'a deleted message',
      { id: 'message-1', is_sender: true, is_deleted: true },
    ],
  ])('does not count %s as a message the member sent', async (_, message) => {
    mocks.listUnipileChatMessagesPage.mockResolvedValue({ items: [message] });

    await whatsappImportChatContactsHandler(PAYLOAD);

    const [{ hasUserSentMessage }] =
      mocks.resolveWhatsappChatPersons.mock.calls[0];

    await expect(hasUserSentMessage()).resolves.toBe(false);
  });

  it('skips a conversation where no participant shows a phone number', async () => {
    await expect(
      whatsappImportChatContactsHandler({
        ...PAYLOAD,
        chat: {
          ...CHAT,
          user: { id: 'hidden@lid', display_name: 'Hidden number' },
        },
      }),
    ).resolves.toEqual({ status: 'SKIPPED' });
    expect(mocks.resolveWhatsappChatPersons).not.toHaveBeenCalled();
  });

  it('fetches a listed conversation that came without its participants', async () => {
    mocks.getUnipileChatIfExists.mockResolvedValueOnce(CHAT);

    await whatsappImportChatContactsHandler({
      ...PAYLOAD,
      chat: { ...CHAT, user: undefined },
    });

    expect(mocks.resolveWhatsappChatPersons).toHaveBeenCalledWith(
      expect.objectContaining({ counterparts: [ADA_COUNTERPART] }),
    );
  });

  it('skips a conversation that no longer exists', async () => {
    mocks.getUnipileChatIfExists.mockResolvedValueOnce(undefined);

    await expect(
      whatsappImportChatContactsHandler({
        ...PAYLOAD,
        chat: { ...CHAT, user: undefined },
      }),
    ).resolves.toEqual({ status: 'SKIPPED' });
    expect(mocks.kvStore.get(CHAT_KEY)).toEqual({ status: 'SKIPPED' });
  });

  it('waits for the Unipile rate limit to reset', async () => {
    vi.useFakeTimers({ now: Date.UTC(2026, 0, 1) });
    mocks.resolveWhatsappChatPersons.mockRejectedValue(
      new UnipileRateLimitError('Too many requests', 3600),
    );

    await expect(whatsappImportChatContactsHandler(PAYLOAD)).resolves.toEqual({
      status: 'PAUSED',
    });

    const [enqueueInput] = getEnqueueInputs();

    expect(getEnqueueInputs()).toHaveLength(1);
    expect(enqueueInput.delayMs).toBe(3_600_000);
    expect(enqueueInput.limiter).toBeUndefined();
    expect(enqueueInput.jobs[0].jobId).toBe(
      `whatsapp-history-contacts-run-1-${getWhatsappChatJobIdSegment('chat-1')}-1`,
    );
    expect(mocks.kvStore.get(CHAT_KEY)).toEqual(
      expect.objectContaining({
        status: 'IMPORTING',
        resumeAt: '2026-01-01T01:00:00.000Z',
      }),
    );
  });

  it('marks the conversation as failed on an error Twenty will not retry', async () => {
    mocks.resolveWhatsappChatPersons.mockRejectedValue(new Error('Boom'));

    await expect(
      whatsappImportChatContactsHandler(PAYLOAD, {
        retryCount: 3,
        maxRetries: 3,
      }),
    ).rejects.toThrow('Boom');
    expect(mocks.kvStore.get(CHAT_KEY)).toEqual({
      status: 'FAILED',
      error: { code: 'UNKNOWN', message: 'Boom' },
    });
    expect(mocks.kvStore.get(NEXT_CHAT_KEY)).toEqual(
      expect.objectContaining({ status: 'IMPORTING' }),
    );
  });

  it('does not hand over a second time when a retry runs after the next conversation was started', async () => {
    mocks.kvStore.set(PLANNING_KEY, {
      chatIds: ['chat-1', 'chat-2', 'chat-3'],
    });
    mocks.kvStore.set(NEXT_CHAT_KEY, {
      status: 'IMPORTING',
      job: {
        kind: 'CONTACTS',
        payload: { ...PAYLOAD, chat: { ...CHAT, id: 'chat-2' } },
      },
    });
    mocks.kvStore.set(
      'whatsapp-history-import-chat:connection-id:run-1:chat-3',
      { status: 'PENDING', chat: { ...CHAT, id: 'chat-3' } },
    );

    await whatsappImportChatContactsHandler(PAYLOAD);

    expect(
      getEnqueueInputs().flatMap((input) =>
        input.jobs.map((job: { jobId: string }) => job.jobId),
      ),
    ).toEqual([
      `whatsapp-history-messages-run-1-${getWhatsappChatJobIdSegment('chat-1')}-0-0`,
    ]);
    expect(
      mocks.kvStore.get(
        'whatsapp-history-import-chat:connection-id:run-1:chat-3',
      ),
    ).toEqual(expect.objectContaining({ status: 'PENDING' }));
  });

  it('does nothing once the run is cancelled', async () => {
    mocks.kvStore.set(STATE_KEY, { ...RUNNING_STATE, status: 'CANCELLED' });

    await expect(whatsappImportChatContactsHandler(PAYLOAD)).resolves.toEqual({
      status: 'CANCELLED',
    });
    expect(mocks.resolveWhatsappChatPersons).not.toHaveBeenCalled();
  });
});
