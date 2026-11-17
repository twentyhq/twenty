import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type SendAppMessagePayload } from 'twenty-sdk/logic-function';

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

const { UnipileRequestError } =
  await import('src/unipile/utils/request-unipile.util');

const { linkedinSendMessageHandler } =
  await import('src/logic-functions/linkedin-send-message');

const PAYLOAD: SendAppMessagePayload = {
  conversationStyle: 'chat',
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
      deadlineAtMs: expect.any(Number),
    });
    expect(mocks.downloadSendMessageAttachmentOrThrow).not.toHaveBeenCalled();
  });

  it('downloads each attachment and sends it with the reply', async () => {
    mocks.downloadSendMessageAttachmentOrThrow.mockResolvedValue({
      content: Buffer.from('report'),
      contentType: 'application/pdf',
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
          content: Buffer.from('report'),
          contentType: 'application/pdf',
          filename: 'deck.pdf',
        },
      ],
      deadlineAtMs: expect.any(Number),
    });
  });

  it('refuses attachments announced above the total size limit without downloading them', async () => {
    await expect(
      linkedinSendMessageHandler({
        ...PAYLOAD,
        attachments: [
          { ...ATTACHMENT, size: 20 * 1024 * 1024 },
          { ...ATTACHMENT, filename: 'photo.png', size: 10 * 1024 * 1024 },
        ],
      }),
    ).rejects.toThrow(
      'Attachments of a reply are larger than 26214400 bytes in total',
    );
    expect(mocks.downloadSendMessageAttachmentOrThrow).not.toHaveBeenCalled();
    expect(mocks.sendUnipileChatMessage).not.toHaveBeenCalled();
  });

  it('limits each later download to what is left of the total size limit', async () => {
    mocks.downloadSendMessageAttachmentOrThrow.mockResolvedValue({
      content: Buffer.alloc(1024),
      contentType: 'application/pdf',
      filename: 'deck.pdf',
    });

    await linkedinSendMessageHandler({
      ...PAYLOAD,
      attachments: [ATTACHMENT, { ...ATTACHMENT, filename: 'photo.png' }],
    });

    expect(mocks.downloadSendMessageAttachmentOrThrow).toHaveBeenLastCalledWith(
      expect.objectContaining({ maxSizeBytes: 25 * 1024 * 1024 - 1024 }),
    );
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

  describe('when LinkedIn refuses the attachments sent together', () => {
    const DECK = {
      content: Buffer.from('deck'),
      contentType: 'application/pdf',
      filename: 'deck.pdf',
    };
    const ARCHIVE = {
      content: Buffer.from('archive'),
      contentType: 'application/zip',
      filename: 'archive.zip',
    };
    const UNSUPPORTED_MEDIA_TYPE_ERROR = new UnipileRequestError(
      'Unipile send message failed (415): Unsupported media type',
      415,
    );
    const TWO_ATTACHMENTS = [
      ATTACHMENT,
      { ...ATTACHMENT, filename: 'archive.zip' },
    ];
    const STARTED_AT = new Date('2026-01-01T10:00:00.000Z');
    const DEADLINE_AT_MS = STARTED_AT.getTime() + 50_000;
    const CHAT = {
      accountId: 'acc_1',
      chatId: 'chat-1',
      deadlineAtMs: DEADLINE_AT_MS,
    };

    const sendAfter = (seconds: number, externalId: string) => async () => {
      vi.advanceTimersByTime(seconds * 1000);

      return externalId;
    };

    const refuseAfter = (seconds: number, error: Error) => async () => {
      vi.advanceTimersByTime(seconds * 1000);

      throw error;
    };

    beforeEach(() => {
      vi.useFakeTimers({ now: STARTED_AT });
      mocks.downloadSendMessageAttachmentOrThrow.mockImplementation(
        async ({ attachment }: { attachment: { filename: string } }) =>
          attachment.filename === 'archive.zip' ? ARCHIVE : DECK,
      );
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('sends the text, then each attachment on its own, and reports the refused ones', async () => {
      mocks.sendUnipileChatMessage
        .mockImplementationOnce(refuseAfter(1, UNSUPPORTED_MEDIA_TYPE_ERROR))
        .mockImplementationOnce(sendAfter(2, 'message-text'))
        .mockImplementationOnce(sendAfter(5, 'message-deck'))
        .mockImplementationOnce(refuseAfter(1, UNSUPPORTED_MEDIA_TYPE_ERROR));

      await expect(
        linkedinSendMessageHandler({
          ...PAYLOAD,
          attachments: TWO_ATTACHMENTS,
        }),
      ).resolves.toEqual({
        externalId: 'message-text',
        sentAt: '2026-01-01T10:00:03.000Z',
        splitAttachments: [
          {
            attachmentIndex: 0,
            externalId: 'message-deck',
            sentAt: '2026-01-01T10:00:08.000Z',
          },
        ],
        rejectedAttachmentIndexes: [1],
      });

      expect(mocks.sendUnipileChatMessage.mock.calls).toEqual([
        [{ ...CHAT, text: 'Thanks, talk soon', attachments: [DECK, ARCHIVE] }],
        [{ ...CHAT, text: 'Thanks, talk soon', attachments: [] }],
        [{ ...CHAT, text: '', attachments: [DECK] }],
        [{ ...CHAT, text: '', attachments: [ARCHIVE] }],
      ]);
    });

    it('makes the first accepted attachment the message of a reply without text', async () => {
      mocks.sendUnipileChatMessage
        .mockImplementationOnce(refuseAfter(1, UNSUPPORTED_MEDIA_TYPE_ERROR))
        .mockImplementationOnce(refuseAfter(1, UNSUPPORTED_MEDIA_TYPE_ERROR))
        .mockImplementationOnce(sendAfter(2, 'message-archive'));

      await expect(
        linkedinSendMessageHandler({
          ...PAYLOAD,
          text: '',
          attachments: TWO_ATTACHMENTS,
        }),
      ).resolves.toEqual({
        externalId: 'message-archive',
        sentAt: '2026-01-01T10:00:04.000Z',
        splitAttachments: [],
        rejectedAttachmentIndexes: [0],
      });
    });

    it('stops sending attachments once the deadline has passed and reports them', async () => {
      mocks.sendUnipileChatMessage
        .mockImplementationOnce(refuseAfter(1, UNSUPPORTED_MEDIA_TYPE_ERROR))
        .mockImplementationOnce(sendAfter(2, 'message-text'))
        .mockImplementationOnce(sendAfter(47, 'message-deck'));

      await expect(
        linkedinSendMessageHandler({
          ...PAYLOAD,
          attachments: TWO_ATTACHMENTS,
        }),
      ).resolves.toEqual({
        externalId: 'message-text',
        sentAt: '2026-01-01T10:00:03.000Z',
        splitAttachments: [
          {
            attachmentIndex: 0,
            externalId: 'message-deck',
            sentAt: '2026-01-01T10:00:50.000Z',
          },
        ],
        rejectedAttachmentIndexes: [1],
      });
      expect(mocks.sendUnipileChatMessage).toHaveBeenCalledTimes(3);
    });

    it('fails a reply without text when every attachment is refused', async () => {
      mocks.sendUnipileChatMessage.mockRejectedValue(
        UNSUPPORTED_MEDIA_TYPE_ERROR,
      );

      await expect(
        linkedinSendMessageHandler({
          ...PAYLOAD,
          text: '',
          attachments: TWO_ATTACHMENTS,
        }),
      ).rejects.toThrow('LinkedIn refused every attachment of the reply');
    });

    it('fails a reply without text on another error before anything is sent', async () => {
      const rateLimitError = new UnipileRequestError('Too many requests', 429);

      mocks.sendUnipileChatMessage
        .mockRejectedValueOnce(UNSUPPORTED_MEDIA_TYPE_ERROR)
        .mockRejectedValueOnce(rateLimitError);

      await expect(
        linkedinSendMessageHandler({
          ...PAYLOAD,
          text: '',
          attachments: TWO_ATTACHMENTS,
        }),
      ).rejects.toBe(rateLimitError);
      expect(mocks.sendUnipileChatMessage).toHaveBeenCalledTimes(2);
    });

    it('reports an attachment that fails after the text was sent instead of failing the reply', async () => {
      mocks.sendUnipileChatMessage
        .mockRejectedValueOnce(UNSUPPORTED_MEDIA_TYPE_ERROR)
        .mockResolvedValueOnce('message-text')
        .mockRejectedValueOnce(
          new UnipileRequestError('Too many requests', 429),
        )
        .mockResolvedValueOnce('message-archive');

      await expect(
        linkedinSendMessageHandler({
          ...PAYLOAD,
          attachments: TWO_ATTACHMENTS,
        }),
      ).resolves.toEqual({
        externalId: 'message-text',
        sentAt: STARTED_AT.toISOString(),
        splitAttachments: [
          {
            attachmentIndex: 1,
            externalId: 'message-archive',
            sentAt: STARTED_AT.toISOString(),
          },
        ],
        rejectedAttachmentIndexes: [0],
      });
    });

    it('fails a single refused attachment sent without text', async () => {
      mocks.sendUnipileChatMessage.mockRejectedValue(
        UNSUPPORTED_MEDIA_TYPE_ERROR,
      );

      await expect(
        linkedinSendMessageHandler({
          ...PAYLOAD,
          text: '',
          attachments: [ATTACHMENT],
        }),
      ).rejects.toBe(UNSUPPORTED_MEDIA_TYPE_ERROR);
      expect(mocks.sendUnipileChatMessage).toHaveBeenCalledOnce();
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
