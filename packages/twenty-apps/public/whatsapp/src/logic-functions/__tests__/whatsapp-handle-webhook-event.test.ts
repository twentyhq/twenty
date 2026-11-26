import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type UnipileMessage } from 'src/unipile/types/unipile-message.type';
import { type UnipileWebhookEvent } from 'src/unipile/types/unipile-webhook-event.type';

const mocks = vi.hoisted(() => ({
  listConnections: vi.fn(),
  enqueueJobs: vi.fn(),
  listMessageChannels: vi.fn(),
  ingestMessages: vi.fn(),
  uploadMessageAttachment: vi.fn(),
  reportConnectionAuthFailure: vi.fn(),
  kvGet: vi.fn(),
  kvSet: vi.fn(),
  getUnipileChat: vi.fn(),
  listUnipileChatParticipants: vi.fn(),
  downloadUnipileMessageAttachment: vi.fn(),
  query: vi.fn(),
  mutation: vi.fn(),
}));

vi.mock('twenty-sdk/define', () => ({
  defineLogicFunction: (config: unknown) => config,
}));

vi.mock('twenty-sdk/logic-function', () => ({
  RetryableLogicFunctionError: class RetryableLogicFunctionError extends Error {
    name = 'RetryableLogicFunctionError';
  },
  listConnections: mocks.listConnections,
  enqueueJobs: mocks.enqueueJobs,
  listMessageChannels: mocks.listMessageChannels,
  ingestMessages: mocks.ingestMessages,
  uploadMessageAttachment: mocks.uploadMessageAttachment,
  reportConnectionAuthFailure: mocks.reportConnectionAuthFailure,
  kv: { get: mocks.kvGet, set: mocks.kvSet },
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    query = mocks.query;
    mutation = mocks.mutation;
  },
}));

vi.mock('src/unipile/utils/get-unipile-chat.util', () => ({
  getUnipileChat: mocks.getUnipileChat,
}));

vi.mock('src/unipile/utils/list-unipile-chat-participants.util', () => ({
  listUnipileChatParticipants: mocks.listUnipileChatParticipants,
}));

vi.mock('src/unipile/utils/download-unipile-message-attachment.util', () => ({
  downloadUnipileMessageAttachment: mocks.downloadUnipileMessageAttachment,
}));

const { UnipileRateLimitError, UnipileRequestError } =
  await import('src/unipile/utils/request-unipile.util');

const { whatsappHandleWebhookEventHandler } =
  await import('src/logic-functions/whatsapp-handle-webhook-event');

const CHANNEL_HANDLE = '+33611111111';

const DAPHNE = {
  id: '199912345678901@lid',
  display_name: 'Daphné Müller',
  public_identifier: '33622222222',
};

const buildMessageEvent = (
  payload: Pick<UnipileMessage, 'sender_id' | 'is_sender'> &
    Partial<UnipileMessage>,
): UnipileWebhookEvent => ({
  id: 'evt_1',
  created_at: '2026-10-29T07:44:08.382Z',
  account_id: 'acc_1',
  account_provider: 'whatsapp',
  type: 'message.new',
  payload: {
    id: 'message-1',
    chat_id: 'chat-1',
    text: 'Hello',
    timestamp: '2026-10-29T07:44:08.382Z',
    is_deleted: false,
    is_event: false,
    provider: 'whatsapp',
    ...payload,
  },
});

describe('whatsappHandleWebhookEventHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    mocks.listConnections.mockResolvedValue([
      { id: 'connection-id', externalAccountId: 'acc_1' },
    ]);
    mocks.listMessageChannels.mockResolvedValue([
      { id: 'channel-id', handle: CHANNEL_HANDLE },
    ]);
    mocks.kvGet.mockImplementation(async (key: string) =>
      key === 'whatsapp-settings:connection-id'
        ? { importPolicy: 'ALL' }
        : null,
    );
    mocks.ingestMessages.mockResolvedValue([]);
    mocks.query.mockResolvedValue({ people: { edges: [] } });
    mocks.getUnipileChat.mockResolvedValue({
      id: 'chat-1',
      name: 'Daphné Müller',
      is_group: false,
      is_1to1: true,
      user: DAPHNE,
    });
    mocks.mutation.mockResolvedValue({ createPerson: { id: 'created-id' } });
  });

  it('ingests a received message under the sender phone number', async () => {
    await expect(
      whatsappHandleWebhookEventHandler(
        buildMessageEvent({
          sender_id: DAPHNE.id,
          sender: DAPHNE,
          is_sender: false,
        }),
      ),
    ).resolves.toEqual({ handled: true });

    expect(mocks.ingestMessages).toHaveBeenCalledExactlyOnceWith({
      messageChannelId: 'channel-id',
      messages: [
        expect.objectContaining({
          externalId: 'message-1',
          threadExternalId: 'chat-1',
          participants: [
            {
              role: 'FROM',
              handle: '+33622222222',
              displayName: 'Daphné Müller',
            },
            { role: 'TO', handle: CHANNEL_HANDLE },
          ],
        }),
      ],
    });
  });

  it('stores the image of a received message as a message attachment', async () => {
    mocks.downloadUnipileMessageAttachment.mockResolvedValue(
      Buffer.from('png'),
    );
    mocks.ingestMessages.mockResolvedValue([
      {
        externalId: 'message-1',
        messageId: 'message-id',
        messageThreadId: 'thread-id',
        hasAttachments: false,
      },
    ]);
    mocks.uploadMessageAttachment.mockResolvedValue({
      fileId: 'file-id',
      label: 'whatsapp-image.png',
    });

    await expect(
      whatsappHandleWebhookEventHandler(
        buildMessageEvent({
          sender_id: DAPHNE.id,
          sender: DAPHNE,
          is_sender: false,
          text: '',
          attachments: [
            { id: 'attachment-1', type: 'img', mimetype: 'image/png' },
          ],
        }),
      ),
    ).resolves.toEqual({ handled: true });

    expect(
      mocks.downloadUnipileMessageAttachment,
    ).toHaveBeenCalledExactlyOnceWith({
      accountId: 'acc_1',
      chatId: 'chat-1',
      messageId: 'message-1',
      attachmentId: 'attachment-1',
      maxSizeBytes: 25 * 1024 * 1024,
      deadlineAtMs: expect.any(Number),
    });
    expect(mocks.uploadMessageAttachment).toHaveBeenCalledExactlyOnceWith({
      filename: 'whatsapp-image.png',
      content: new Uint8Array(Buffer.from('png')),
      signal: expect.any(AbortSignal),
    });
    expect(mocks.ingestMessages).toHaveBeenCalledTimes(2);
    expect(mocks.ingestMessages.mock.calls[1][0].messages).toEqual([
      expect.objectContaining({
        externalId: 'message-1',
        attachments: [{ fileId: 'file-id', label: 'whatsapp-image.png' }],
      }),
    ]);
  });

  it('imports a group message from a stranger when another member is a contact', async () => {
    const ada = {
      id: '33633333333@s.whatsapp.net',
      display_name: 'Ada Lovelace',
    };

    mocks.getUnipileChat.mockResolvedValue({
      id: 'chat-1',
      name: 'Founders',
      is_group: true,
      is_1to1: false,
      participants: [
        { is_self: false, user: ada },
        { is_self: false, user: DAPHNE },
      ],
    });
    mocks.query.mockImplementation(async (query: unknown) =>
      JSON.stringify(query).includes('"633333333"')
        ? {
            people: {
              edges: [
                {
                  node: {
                    id: 'ada-id',
                    phones: {
                      primaryPhoneCallingCode: '+33',
                      primaryPhoneNumber: '633333333',
                    },
                  },
                },
              ],
            },
          }
        : { people: { edges: [] } },
    );

    await expect(
      whatsappHandleWebhookEventHandler(
        buildMessageEvent({
          sender_id: DAPHNE.id,
          sender: DAPHNE,
          is_sender: false,
        }),
      ),
    ).resolves.toEqual({ handled: true });

    expect(mocks.ingestMessages).toHaveBeenCalledOnce();
  });

  it('links a group message to the members Unipile lists apart from the chat', async () => {
    const ada = {
      id: '33633333333@s.whatsapp.net',
      display_name: 'Ada Lovelace',
    };

    mocks.getUnipileChat.mockResolvedValue({
      id: 'chat-1',
      name: 'Founders',
      is_group: true,
      is_1to1: false,
    });
    mocks.listUnipileChatParticipants.mockResolvedValue([
      { is_self: true, user: { id: 'self', display_name: 'Me' } },
      { is_self: false, user: ada },
      { is_self: false, user: DAPHNE },
    ]);
    mocks.query.mockImplementation(async (query: unknown) => ({
      people: {
        edges: JSON.stringify(query).includes('"633333333"')
          ? [
              {
                node: {
                  id: 'ada-id',
                  phones: {
                    primaryPhoneCallingCode: '+33',
                    primaryPhoneNumber: '633333333',
                  },
                },
              },
            ]
          : [],
      },
    }));

    await expect(
      whatsappHandleWebhookEventHandler(
        buildMessageEvent({
          sender_id: DAPHNE.id,
          sender: DAPHNE,
          is_sender: false,
        }),
      ),
    ).resolves.toEqual({ handled: true });

    expect(
      mocks.ingestMessages.mock.calls[0][0].messages[0].participants.map(
        (participant: { handle: string }) => participant.handle,
      ),
    ).toContain('+33633333333');
  });

  it('leaves out a message between numbers WhatsApp hides', async () => {
    const hiddenNumberUser = { id: '199900000000001@lid', display_name: 'Lee' };

    mocks.getUnipileChat.mockResolvedValue({
      id: 'chat-1',
      name: 'Lee',
      is_group: false,
      is_1to1: true,
      user: hiddenNumberUser,
    });

    await expect(
      whatsappHandleWebhookEventHandler(
        buildMessageEvent({
          sender_id: hiddenNumberUser.id,
          sender: hiddenNumberUser,
          is_sender: false,
        }),
      ),
    ).resolves.toEqual({
      handled: false,
      reason: 'WhatsApp hides the phone number of the people in this chat',
    });
    expect(mocks.ingestMessages).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(
      '[whatsapp] event evt_1 (message.new) not handled: WhatsApp hides the phone number of the people in this chat',
    );
  });

  it('ingests a sent message to the chat counterpart phone number and creates the person', async () => {
    mocks.getUnipileChat.mockResolvedValue({
      id: 'chat-1',
      name: 'Daphné Müller',
      is_group: false,
      is_1to1: true,
      user: DAPHNE,
    });

    await whatsappHandleWebhookEventHandler(
      buildMessageEvent({
        sender_id: '33611111111@s.whatsapp.net',
        is_sender: true,
      }),
    );

    expect(mocks.ingestMessages).toHaveBeenCalledTimes(1);
    expect(mocks.getUnipileChat).toHaveBeenCalledExactlyOnceWith({
      accountId: 'acc_1',
      chatId: 'chat-1',
      deadlineAtMs: expect.any(Number),
    });
    expect(
      mocks.ingestMessages.mock.calls[0][0].messages[0].participants,
    ).toEqual([
      { role: 'FROM', handle: CHANNEL_HANDLE },
      {
        role: 'TO',
        handle: '+33622222222',
        displayName: 'Daphné Müller',
        personId: 'created-id',
      },
    ]);
    expect(mocks.mutation).toHaveBeenCalledExactlyOnceWith({
      createPerson: {
        __args: {
          data: {
            id: expect.stringMatching(
              /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
            ),
            name: { firstName: 'Daphné', lastName: 'Müller' },
            phones: { primaryPhoneNumber: '+33622222222' },
          },
        },
        id: true,
      },
    });
  });

  it.each([
    [
      'Unipile answers 503',
      new UnipileRequestError('Service unavailable', 503),
    ],
    ['the network drops', new TypeError('fetch failed')],
  ])('asks for the job to be retried when %s', async (_case, error) => {
    mocks.getUnipileChat.mockRejectedValue(error);

    await expect(
      whatsappHandleWebhookEventHandler(
        buildMessageEvent({
          sender_id: DAPHNE.id,
          sender: DAPHNE,
          is_sender: false,
        }),
      ),
    ).rejects.toMatchObject({
      name: 'RetryableLogicFunctionError',
      message: error.message,
    });
    expect(mocks.ingestMessages).not.toHaveBeenCalled();
  });

  it('runs the event again once the rate limit has reset, not before', async () => {
    mocks.getUnipileChat.mockRejectedValue(
      new UnipileRateLimitError('Retry in 60 seconds.', 61),
    );

    const event = buildMessageEvent({
      sender_id: DAPHNE.id,
      sender: DAPHNE,
      is_sender: false,
    });

    await expect(whatsappHandleWebhookEventHandler(event)).resolves.toEqual({
      handled: false,
      reason: 'Rate limited, retried in 61s',
    });
    expect(mocks.enqueueJobs).toHaveBeenCalledExactlyOnceWith({
      logicFunctionUniversalIdentifier: expect.any(String),
      jobs: [
        {
          jobId: 'whatsapp-webhook-event-evt_1-rate-limit-1',
          payload: { ...event, rateLimitRetryCount: 1 },
        },
      ],
      delayMs: 61_000,
    });
  });

  it('stops waiting for a rate limit that never resets and lets the queue decide', async () => {
    mocks.getUnipileChat.mockRejectedValue(
      new UnipileRateLimitError('Retry in 60 seconds.', 61),
    );

    await expect(
      whatsappHandleWebhookEventHandler({
        ...buildMessageEvent({
          sender_id: DAPHNE.id,
          sender: DAPHNE,
          is_sender: false,
        }),
        rateLimitRetryCount: 3,
      }),
    ).rejects.toMatchObject({ name: 'RetryableLogicFunctionError' });
    expect(mocks.enqueueJobs).not.toHaveBeenCalled();
  });

  it('gives Unipile no longer than the job has left to return the chat', async () => {
    vi.useFakeTimers({ now: 0 });

    await whatsappHandleWebhookEventHandler(
      buildMessageEvent({
        sender_id: DAPHNE.id,
        sender: DAPHNE,
        is_sender: false,
      }),
    );

    expect(mocks.getUnipileChat).toHaveBeenCalledWith(
      expect.objectContaining({ deadlineAtMs: 20_000 }),
    );

    vi.useRealTimers();
  });

  it('fails without a retry on an error another attempt would not fix', async () => {
    mocks.getUnipileChat.mockRejectedValue(
      new UnipileRequestError('Chat not found', 404),
    );

    await expect(
      whatsappHandleWebhookEventHandler(
        buildMessageEvent({
          sender_id: DAPHNE.id,
          sender: DAPHNE,
          is_sender: false,
        }),
      ),
    ).rejects.toMatchObject({ name: 'UnipileRequestError' });
  });

  it('ingests a new message of a conversation the member selected, as it arrives', async () => {
    mocks.kvGet.mockImplementation(async (key: string) =>
      key === 'whatsapp-settings:connection-id'
        ? {
            importPolicy: 'SELECTED',
            selectedChats: [{ id: 'chat-1', name: 'Daphné Müller' }],
          }
        : null,
    );

    await expect(
      whatsappHandleWebhookEventHandler(
        buildMessageEvent({
          sender_id: DAPHNE.id,
          sender: DAPHNE,
          is_sender: false,
        }),
      ),
    ).resolves.toEqual({ handled: true });
    expect(mocks.ingestMessages).toHaveBeenCalledOnce();
  });

  it('leaves out a message of a conversation the member did not select, without reading it', async () => {
    mocks.kvGet.mockImplementation(async (key: string) =>
      key === 'whatsapp-settings:connection-id'
        ? {
            importPolicy: 'SELECTED',
            selectedChats: [{ id: 'chat-2', name: 'chat-2' }],
          }
        : null,
    );

    await expect(
      whatsappHandleWebhookEventHandler(
        buildMessageEvent({
          sender_id: DAPHNE.id,
          sender: DAPHNE,
          is_sender: false,
        }),
      ),
    ).resolves.toEqual({
      handled: false,
      reason: 'Conversation is not selected',
    });
    expect(mocks.getUnipileChat).not.toHaveBeenCalled();
    expect(mocks.ingestMessages).not.toHaveBeenCalled();
  });

  it('ignores events of accounts no connection owns', async () => {
    mocks.listConnections.mockResolvedValue([]);

    await expect(
      whatsappHandleWebhookEventHandler(
        buildMessageEvent({ sender_id: DAPHNE.id, is_sender: false }),
      ),
    ).resolves.toEqual({ handled: false, reason: 'Unknown WhatsApp account' });
    expect(mocks.ingestMessages).not.toHaveBeenCalled();
  });
});
