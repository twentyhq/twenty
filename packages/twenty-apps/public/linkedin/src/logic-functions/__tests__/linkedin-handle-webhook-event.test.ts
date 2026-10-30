import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type UnipileMessage } from 'src/unipile/types/unipile-message.type';
import { type UnipileWebhookEvent } from 'src/unipile/types/unipile-webhook-event.type';

const mocks = vi.hoisted(() => ({
  listConnections: vi.fn(),
  listMessageChannels: vi.fn(),
  ingestMessages: vi.fn(),
  reportConnectionAuthFailure: vi.fn(),
  kvGet: vi.fn(),
  kvSet: vi.fn(),
  getUnipileUser: vi.fn(),
  getUnipileChat: vi.fn(),
  query: vi.fn(),
  mutation: vi.fn(),
}));

vi.mock('twenty-sdk/define', () => ({
  defineLogicFunction: (config: unknown) => config,
}));

vi.mock('twenty-sdk/logic-function', () => ({
  listConnections: mocks.listConnections,
  listMessageChannels: mocks.listMessageChannels,
  ingestMessages: mocks.ingestMessages,
  reportConnectionAuthFailure: mocks.reportConnectionAuthFailure,
  kv: { get: mocks.kvGet, set: mocks.kvSet },
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    query = mocks.query;
    mutation = mocks.mutation;
  },
}));

vi.mock('src/unipile/utils/get-unipile-user.util', () => ({
  getUnipileUser: mocks.getUnipileUser,
}));

vi.mock('src/unipile/utils/get-unipile-chat.util', () => ({
  getUnipileChat: mocks.getUnipileChat,
}));

const { linkedinHandleWebhookEventHandler } =
  await import('src/logic-functions/linkedin-handle-webhook-event');

const CHANNEL_HANDLE = 'linkedin.com/in/martin-muller';

const DAPHNE = {
  id: 'ACoDAPHNE',
  display_name: 'Daphné Müller',
  profile_url: 'https://www.linkedin.com/in/ACoDAPHNE',
};

const buildMessageEvent = (
  payload: Pick<UnipileMessage, 'sender_id' | 'is_sender'> &
    Partial<UnipileMessage>,
): UnipileWebhookEvent => ({
  id: 'evt_1',
  created_at: '2026-10-29T07:44:08.382Z',
  account_id: 'acc_1',
  account_provider: 'linkedin',
  type: 'message.new',
  payload: {
    id: 'message-1',
    chat_id: 'chat-1',
    text: 'Hello',
    timestamp: '2026-10-29T07:44:08.382Z',
    is_deleted: false,
    is_event: false,
    provider: 'linkedin',
    ...payload,
  },
});

describe('linkedinHandleWebhookEventHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listConnections.mockResolvedValue([
      { id: 'connection-id', externalAccountId: 'acc_1' },
    ]);
    mocks.listMessageChannels.mockResolvedValue([
      { id: 'channel-id', handle: CHANNEL_HANDLE },
    ]);
    mocks.kvGet.mockResolvedValue(null);
    mocks.query.mockResolvedValue({ people: { edges: [] } });
    mocks.getUnipileChat.mockResolvedValue({
      id: 'chat-1',
      name: 'Daphné Müller',
      is_group: false,
      is_1to1: true,
      user: DAPHNE,
    });
    mocks.mutation.mockResolvedValue({ createPerson: { id: 'created-id' } });
    mocks.getUnipileUser.mockResolvedValue({
      ...DAPHNE,
      public_identifier: 'daphne-muller',
    });
  });

  it('ingests a received message under the sender public profile URL', async () => {
    await expect(
      linkedinHandleWebhookEventHandler(
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
              handle: 'https://www.linkedin.com/in/daphne-muller',
              displayName: 'Daphné Müller',
            },
            { role: 'TO', handle: CHANNEL_HANDLE },
          ],
        }),
      ],
    });
  });

  it('ingests a sent message to the chat counterpart public profile URL', async () => {
    mocks.getUnipileChat.mockResolvedValue({
      id: 'chat-1',
      name: 'Daphné Müller',
      is_group: false,
      is_1to1: true,
      user: DAPHNE,
    });

    await linkedinHandleWebhookEventHandler(
      buildMessageEvent({ sender_id: 'ACoMARTIN', is_sender: true }),
    );

    expect(mocks.ingestMessages).toHaveBeenCalledTimes(1);
    expect(mocks.getUnipileChat).toHaveBeenCalledExactlyOnceWith({
      accountId: 'acc_1',
      chatId: 'chat-1',
    });
    expect(
      mocks.ingestMessages.mock.calls[0][0].messages[0].participants,
    ).toEqual([
      { role: 'FROM', handle: CHANNEL_HANDLE },
      {
        role: 'TO',
        handle: 'https://www.linkedin.com/in/daphne-muller',
        displayName: 'Daphné Müller',
        personId: 'created-id',
      },
    ]);
    expect(mocks.mutation).toHaveBeenCalledExactlyOnceWith({
      createPerson: {
        __args: {
          data: {
            name: { firstName: 'Daphné', lastName: 'Müller' },
            linkedinLink: {
              primaryLinkUrl: 'https://www.linkedin.com/in/daphne-muller',
            },
          },
        },
        id: true,
      },
    });
  });

  it('ignores events of accounts no connection owns', async () => {
    mocks.listConnections.mockResolvedValue([]);

    await expect(
      linkedinHandleWebhookEventHandler(
        buildMessageEvent({ sender_id: DAPHNE.id, is_sender: false }),
      ),
    ).resolves.toEqual({ handled: false, reason: 'Unknown LinkedIn account' });
    expect(mocks.ingestMessages).not.toHaveBeenCalled();
  });
});
