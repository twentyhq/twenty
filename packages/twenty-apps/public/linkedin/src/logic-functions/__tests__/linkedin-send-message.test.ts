import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getConnection: vi.fn(),
  sendUnipileChatMessage: vi.fn(),
  downloadSendMessageAttachmentOrThrow: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  getConnection: mocks.getConnection,
}));

vi.mock('src/unipile/utils/send-unipile-chat-message.util', () => ({
  sendUnipileChatMessage: mocks.sendUnipileChatMessage,
}));

vi.mock(
  'src/logic-functions/utils/download-send-message-attachment.util',
  () => ({
    downloadSendMessageAttachmentOrThrow:
      mocks.downloadSendMessageAttachmentOrThrow,
  }),
);

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
  attachments: [],
};

const ATTACHMENT = {
  filename: 'deck.pdf',
  contentType: 'application/pdf',
  size: 1024,
  downloadUrl: 'https://twenty.example/file/email-attachment/file-1?token=t',
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
    expect(mocks.downloadSendMessageAttachmentOrThrow).not.toHaveBeenCalled();
  });

  it('downloads each attachment and sends it with the reply', async () => {
    mocks.downloadSendMessageAttachmentOrThrow.mockResolvedValue({
      content: 'cmVwb3J0',
      content_type: 'application/pdf',
      filename: 'deck.pdf',
    });

    await linkedinSendMessageHandler({
      ...PAYLOAD,
      text: '',
      attachments: [ATTACHMENT],
    });

    expect(
      mocks.downloadSendMessageAttachmentOrThrow,
    ).toHaveBeenCalledExactlyOnceWith({
      attachment: ATTACHMENT,
      maxSizeBytes: 25 * 1024 * 1024,
      deadlineAtMs: expect.any(Number),
    });
    expect(mocks.sendUnipileChatMessage).toHaveBeenCalledExactlyOnceWith({
      accountId: 'acc_1',
      chatId: 'chat-1',
      text: '',
      attachments: [
        {
          content: 'cmVwb3J0',
          content_type: 'application/pdf',
          filename: 'deck.pdf',
        },
      ],
    });
  });

  it('sends nothing when an attachment cannot be downloaded', async () => {
    mocks.downloadSendMessageAttachmentOrThrow.mockRejectedValue(
      new Error('Attachment deck.pdf is larger than 26214400 bytes'),
    );

    await expect(
      linkedinSendMessageHandler({ ...PAYLOAD, attachments: [ATTACHMENT] }),
    ).rejects.toThrow('Attachment deck.pdf is larger than 26214400 bytes');
    expect(mocks.sendUnipileChatMessage).not.toHaveBeenCalled();
  });

  it('treats a payload without attachments as a text reply', async () => {
    await linkedinSendMessageHandler({ ...PAYLOAD, attachments: undefined });

    expect(mocks.sendUnipileChatMessage).toHaveBeenCalledWith(
      expect.objectContaining({ attachments: [] }),
    );
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
