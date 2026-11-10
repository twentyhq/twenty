import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getConnection: vi.fn(),
  sendUnipileChatMessage: vi.fn(),
  fetch: vi.fn(),
}));

vi.stubGlobal('fetch', mocks.fetch);

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
      attachments: [],
    });
  });

  it('downloads the attachments from Twenty and sends them with the reply', async () => {
    mocks.fetch.mockResolvedValue(new Response('pdf-content'));

    await linkedinSendMessageHandler({
      ...PAYLOAD,
      attachments: [
        {
          filename: 'offer.pdf',
          mimeType: 'application/pdf',
          size: 11,
          url: 'https://twenty.test/file/files-field/file-1?token=signed',
        },
      ],
    });

    expect(mocks.fetch).toHaveBeenCalledExactlyOnceWith(
      'https://twenty.test/file/files-field/file-1?token=signed',
    );
    expect(mocks.sendUnipileChatMessage).toHaveBeenCalledExactlyOnceWith({
      accountId: 'acc_1',
      chatId: 'chat-1',
      text: 'Thanks, talk soon',
      attachments: [
        {
          filename: 'offer.pdf',
          content_type: 'application/pdf',
          content: Buffer.from('pdf-content').toString('base64'),
        },
      ],
    });
  });

  it('sends nothing when an attachment is over the size limit', async () => {
    await expect(
      linkedinSendMessageHandler({
        ...PAYLOAD,
        attachments: [
          {
            filename: 'movie.mp4',
            mimeType: 'video/mp4',
            size: 26 * 1024 * 1024,
            url: 'https://twenty.test/file/files-field/file-2?token=signed',
          },
        ],
      }),
    ).rejects.toThrow('Attachment movie.mp4 is larger than 26214400 bytes');

    expect(mocks.fetch).not.toHaveBeenCalled();
    expect(mocks.sendUnipileChatMessage).not.toHaveBeenCalled();
  });

  it('sends nothing when an attachment cannot be downloaded', async () => {
    mocks.fetch.mockResolvedValue(new Response(null, { status: 403 }));

    await expect(
      linkedinSendMessageHandler({
        ...PAYLOAD,
        attachments: [
          {
            filename: 'offer.pdf',
            mimeType: 'application/pdf',
            size: 11,
            url: 'https://twenty.test/file/files-field/file-1?token=expired',
          },
        ],
      }),
    ).rejects.toThrow(
      'Attachment offer.pdf could not be downloaded from Twenty (403)',
    );

    expect(mocks.sendUnipileChatMessage).not.toHaveBeenCalled();
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
