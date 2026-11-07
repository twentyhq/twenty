import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getConnection: vi.fn(),
  sendUnipileChatMessage: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  getConnection: mocks.getConnection,
}));

vi.mock('src/unipile/utils/send-unipile-chat-message.util', () => ({
  sendUnipileChatMessage: mocks.sendUnipileChatMessage,
}));

const { linkedinSendMessageHandler } =
  await import('src/logic-functions/linkedin-send-message');

const PAYLOAD = {
  messagingProviderName: 'linkedin-messaging',
  connectedAccountId: 'connected-account-id',
  messageChannelId: 'channel-id',
  threadExternalId: 'chat-1',
  text: 'Thanks, talk soon',
  idempotencyKey: '3f1c2a4e-5b6d-4e7f-8a9b-0c1d2e3f4a5b',
  recipients: [
    {
      handle: 'https://www.linkedin.com/in/grace-hopper',
      displayName: 'Grace Hopper',
    },
  ],
};

describe('linkedinSendMessageHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getConnection.mockResolvedValue({ externalAccountId: 'acc_1' });
    mocks.sendUnipileChatMessage.mockResolvedValue('message-1');
  });

  it('replies in the Unipile chat of the thread and returns the sent message id', async () => {
    await expect(linkedinSendMessageHandler(PAYLOAD)).resolves.toEqual({
      externalId: 'message-1',
    });

    expect(mocks.getConnection).toHaveBeenCalledExactlyOnceWith(
      'connected-account-id',
    );
    expect(mocks.sendUnipileChatMessage).toHaveBeenCalledExactlyOnceWith({
      accountId: 'acc_1',
      chatId: 'chat-1',
      text: 'Thanks, talk soon',
    });
  });

  it('refuses to send through a connection without a Unipile account', async () => {
    mocks.getConnection.mockResolvedValue({ externalAccountId: null });

    await expect(linkedinSendMessageHandler(PAYLOAD)).rejects.toThrow(
      'LinkedIn connection connected-account-id has no Unipile account',
    );
    expect(mocks.sendUnipileChatMessage).not.toHaveBeenCalled();
  });

  it('fails the reply when Unipile does', async () => {
    mocks.sendUnipileChatMessage.mockRejectedValue(
      new Error('Unipile send message failed (403): Forbidden'),
    );

    await expect(linkedinSendMessageHandler(PAYLOAD)).rejects.toThrow(
      'Unipile send message failed (403): Forbidden',
    );
  });
});
