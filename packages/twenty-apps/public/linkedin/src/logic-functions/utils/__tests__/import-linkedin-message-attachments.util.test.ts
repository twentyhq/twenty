import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type LinkedinMessageAttachments } from 'src/logic-functions/types/linkedin-message-attachments.type';
import { type UnipileMessage } from 'src/unipile/types/unipile-message.type';
import { type UnipileMessageAttachment } from 'src/unipile/types/unipile-message-attachment.type';
import { UnipileRateLimitError } from 'src/unipile/utils/request-unipile.util';

const mocks = vi.hoisted(() => ({
  downloadUnipileMessageAttachment: vi.fn(),
  uploadMessageAttachment: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  uploadMessageAttachment: mocks.uploadMessageAttachment,
}));

vi.mock('src/unipile/utils/download-unipile-message-attachment.util', () => ({
  downloadUnipileMessageAttachment: mocks.downloadUnipileMessageAttachment,
}));

const { importLinkedinMessageAttachments } =
  await import('src/logic-functions/utils/import-linkedin-message-attachments.util');

const MAX_SIZE_BYTES = 25 * 1024 * 1024;

const buildMessage = (
  attachments: UnipileMessageAttachment[],
): UnipileMessage => ({
  id: 'message-1',
  chat_id: 'chat-1',
  sender_id: 'ACoPRIYA',
  timestamp: '2026-10-29T07:44:08.382Z',
  is_sender: false,
  is_deleted: false,
  is_event: false,
  provider: 'linkedin',
  attachments,
});

const importAttachments = async ({
  attachments,
  deadlineAtMs = Date.now() + 60_000,
}: {
  attachments: UnipileMessageAttachment[];
  deadlineAtMs?: number;
}) => {
  const importedMessages: LinkedinMessageAttachments[] = [];
  const importedCount = await importLinkedinMessageAttachments({
    unipileAccountId: 'acc_1',
    messages: [buildMessage(attachments)],
    deadlineAtMs,
    onMessageAttachments: async (messageAttachments) => {
      importedMessages.push(messageAttachments);
    },
  });

  return {
    files: importedMessages.flatMap(({ attachments }) => attachments),
    importedMessages,
    importedCount,
  };
};

describe('importLinkedinMessageAttachments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    mocks.downloadUnipileMessageAttachment.mockResolvedValue(
      Buffer.from('downloaded'),
    );
    mocks.uploadMessageAttachment.mockImplementation(
      async ({ filename }: { filename: string }) => ({
        fileId: `file-id-${mocks.uploadMessageAttachment.mock.calls.length}`,
        label: filename,
      }),
    );
  });

  const uploadedContents = () =>
    mocks.uploadMessageAttachment.mock.calls.map(([{ content }]) =>
      Buffer.from(content).toString(),
    );

  it('uploads images, videos, audio and documents and reports them per message', async () => {
    const deadlineAtMs = Date.now() + 60_000;
    const { importedMessages, importedCount } = await importAttachments({
      attachments: [
        { id: 'img-1', type: 'img', mimetype: 'image/jpeg' },
        { id: 'video-1', type: 'video', mimetype: 'video/mp4' },
        { id: 'audio-1', type: 'audio', mimetype: 'audio/mpeg' },
        {
          id: 'file-1',
          type: 'file',
          mimetype: 'application/pdf',
          filename: 'Proposal.pdf',
        },
      ],
      deadlineAtMs,
    });

    expect(importedCount).toBe(4);
    expect(importedMessages).toEqual([
      {
        messageExternalId: 'message-1',
        attachments: [
          { fileId: 'file-id-1', label: 'linkedin-image.jpg' },
          { fileId: 'file-id-2', label: 'linkedin-video.mp4' },
          { fileId: 'file-id-3', label: 'linkedin-audio.mpeg' },
          { fileId: 'file-id-4', label: 'Proposal.pdf' },
        ],
      },
    ]);
    expect(mocks.downloadUnipileMessageAttachment).toHaveBeenCalledWith({
      accountId: 'acc_1',
      chatId: 'chat-1',
      messageId: 'message-1',
      attachmentId: 'img-1',
      maxSizeBytes: MAX_SIZE_BYTES,
      deadlineAtMs,
    });
    expect(uploadedContents()[0]).toBe('downloaded');
  });

  it('uses the inline content instead of downloading it', async () => {
    await importAttachments({
      attachments: [
        {
          id: 'img-1',
          type: 'img',
          mimetype: 'image/png',
          content: Buffer.from('inline').toString('base64'),
        },
      ],
    });

    expect(uploadedContents()).toEqual(['inline']);
    expect(mocks.downloadUnipileMessageAttachment).not.toHaveBeenCalled();
  });

  it('skips other, unavailable and oversized attachments', async () => {
    await expect(
      importAttachments({
        attachments: [
          { id: 'post-1', type: 'shared_content', mimetype: 'text/html' },
          {
            id: 'img-1',
            type: 'img',
            mimetype: 'image/png',
            is_unavailable: true,
          },
          {
            id: 'video-1',
            type: 'video',
            mimetype: 'video/mp4',
            file_size: 500 * 1024 * 1024,
          },
        ],
      }),
    ).resolves.toEqual({ files: [], importedMessages: [], importedCount: 0 });
    expect(mocks.downloadUnipileMessageAttachment).not.toHaveBeenCalled();
    expect(mocks.uploadMessageAttachment).not.toHaveBeenCalled();
  });

  it('drops inline content over the size limit when no size was listed', async () => {
    await expect(
      importAttachments({
        attachments: [
          {
            id: 'video-1',
            type: 'video',
            mimetype: 'video/mp4',
            content: Buffer.alloc(MAX_SIZE_BYTES + 1).toString('base64'),
          },
        ],
      }),
    ).resolves.toEqual({ files: [], importedMessages: [], importedCount: 0 });
    expect(mocks.uploadMessageAttachment).not.toHaveBeenCalled();
  });

  it('drops a file that fails to download and keeps the others', async () => {
    mocks.downloadUnipileMessageAttachment.mockRejectedValueOnce(
      new Error('Unipile download message attachment failed (404)'),
    );

    const { files } = await importAttachments({
      attachments: [
        { id: 'img-1', type: 'img', mimetype: 'image/png' },
        { id: 'img-2', type: 'img', mimetype: 'image/png' },
      ],
    });

    expect(files).toEqual([
      { fileId: 'file-id-1', label: 'linkedin-image.png' },
    ]);
  });

  it('drops a file that fails to upload and keeps the others', async () => {
    mocks.uploadMessageAttachment.mockRejectedValueOnce(
      new Error('upload failed'),
    );

    const { importedCount } = await importAttachments({
      attachments: [
        { id: 'img-1', type: 'img', mimetype: 'image/png' },
        { id: 'img-2', type: 'img', mimetype: 'image/png' },
      ],
    });

    expect(importedCount).toBe(1);
  });

  it('attaches nothing to a message cut by the deadline', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(Date.parse('2026-10-29T08:00:00.000Z'));
    mocks.downloadUnipileMessageAttachment.mockImplementation(async () => {
      vi.advanceTimersByTime(2_000);

      return Buffer.from('downloaded');
    });

    try {
      const { importedMessages, importedCount } = await importAttachments({
        attachments: [
          { id: 'img-1', type: 'img', mimetype: 'image/png' },
          { id: 'img-2', type: 'img', mimetype: 'image/png' },
        ],
        deadlineAtMs: Date.now() + 1_000,
      });

      expect(importedCount).toBe(0);
      expect(importedMessages).toEqual([]);
      expect(mocks.downloadUnipileMessageAttachment).toHaveBeenCalledOnce();
    } finally {
      vi.useRealTimers();
    }
  });

  it('attaches nothing when the last file of a message hits the deadline', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(Date.parse('2026-10-29T08:00:00.000Z'));
    mocks.downloadUnipileMessageAttachment
      .mockResolvedValueOnce(Buffer.from('downloaded'))
      .mockImplementationOnce(async () => {
        vi.advanceTimersByTime(2_000);

        throw new Error('The operation was aborted due to timeout');
      });

    try {
      const { importedMessages, importedCount } = await importAttachments({
        attachments: [
          { id: 'img-1', type: 'img', mimetype: 'image/png' },
          { id: 'img-2', type: 'img', mimetype: 'image/png' },
        ],
        deadlineAtMs: Date.now() + 1_000,
      });

      expect(mocks.uploadMessageAttachment).not.toHaveBeenCalled();
      expect(importedCount).toBe(0);
      expect(importedMessages).toEqual([]);
    } finally {
      vi.useRealTimers();
    }
  });

  it('attaches nothing when an upload fails at the deadline', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(Date.parse('2026-10-29T08:00:00.000Z'));
    mocks.uploadMessageAttachment
      .mockResolvedValueOnce({
        fileId: 'file-id-1',
        label: 'linkedin-image.png',
      })
      .mockImplementationOnce(async () => {
        vi.advanceTimersByTime(2_000);

        throw new Error('The operation was aborted due to timeout');
      });

    try {
      const { importedMessages, importedCount } = await importAttachments({
        attachments: [
          { id: 'img-1', type: 'img', mimetype: 'image/png' },
          { id: 'img-2', type: 'img', mimetype: 'image/png' },
        ],
        deadlineAtMs: Date.now() + 1_000,
      });

      expect(importedCount).toBe(0);
      expect(importedMessages).toEqual([]);
    } finally {
      vi.useRealTimers();
    }
  });

  it('keeps going when attaching the files of a message fails', async () => {
    const onMessageAttachments = vi
      .fn()
      .mockRejectedValueOnce(new Error('attachments unavailable'))
      .mockResolvedValue(undefined);

    const importedCount = await importLinkedinMessageAttachments({
      unipileAccountId: 'acc_1',
      messages: [
        buildMessage([{ id: 'img-1', type: 'img', mimetype: 'image/png' }]),
        {
          ...buildMessage([
            { id: 'img-2', type: 'img', mimetype: 'image/png' },
          ]),
          id: 'message-2',
        },
      ],
      deadlineAtMs: Date.now() + 60_000,
      onMessageAttachments,
    });

    expect(importedCount).toBe(1);
    expect(onMessageAttachments).toHaveBeenCalledTimes(2);
  });

  it('lets a rate limit through so the import can pause', async () => {
    mocks.downloadUnipileMessageAttachment.mockRejectedValue(
      new UnipileRateLimitError('rate limited', 3600),
    );

    await expect(
      importAttachments({
        attachments: [{ id: 'img-1', type: 'img', mimetype: 'image/png' }],
      }),
    ).rejects.toBeInstanceOf(UnipileRateLimitError);
  });
});
