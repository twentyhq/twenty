import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type LinkedinMessageAttachmentFile } from 'src/logic-functions/types/linkedin-message-attachment-file.type';
import { type UnipileMessage } from 'src/unipile/types/unipile-message.type';
import { type UnipileMessageAttachment } from 'src/unipile/types/unipile-message-attachment.type';
import { UnipileRateLimitError } from 'src/unipile/utils/request-unipile.util';

const mocks = vi.hoisted(() => ({
  downloadUnipileMessageAttachment: vi.fn(),
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
  const files: LinkedinMessageAttachmentFile[] = [];
  const importedCount = await importLinkedinMessageAttachments({
    unipileAccountId: 'acc_1',
    messages: [buildMessage(attachments)],
    deadlineAtMs,
    onAttachmentFile: async (file) => {
      files.push(file);
    },
  });

  return { files, importedCount };
};

describe('importLinkedinMessageAttachments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    mocks.downloadUnipileMessageAttachment.mockResolvedValue(
      Buffer.from('downloaded'),
    );
  });

  it('downloads images, videos and audio', async () => {
    const deadlineAtMs = Date.now() + 60_000;
    const { files, importedCount } = await importAttachments({
      attachments: [
        { id: 'img-1', type: 'img', mimetype: 'image/jpeg' },
        { id: 'video-1', type: 'video', mimetype: 'video/mp4' },
        { id: 'audio-1', type: 'audio', mimetype: 'audio/mpeg' },
      ],
      deadlineAtMs,
    });

    expect(importedCount).toBe(3);
    expect(files.map(({ attachmentId }) => attachmentId)).toEqual([
      'img-1',
      'video-1',
      'audio-1',
    ]);
    expect(mocks.downloadUnipileMessageAttachment).toHaveBeenCalledWith({
      accountId: 'acc_1',
      chatId: 'chat-1',
      messageId: 'message-1',
      attachmentId: 'img-1',
      maxSizeBytes: MAX_SIZE_BYTES,
      deadlineAtMs,
    });
    expect(files[0]).toMatchObject({
      messageExternalId: 'message-1',
      mimeType: 'image/jpeg',
      content: Buffer.from('downloaded'),
    });
  });

  it('uses the inline content instead of downloading it', async () => {
    const { files } = await importAttachments({
      attachments: [
        {
          id: 'img-1',
          type: 'img',
          mimetype: 'image/png',
          content: Buffer.from('inline').toString('base64'),
        },
      ],
    });

    expect(files[0]?.content.toString()).toBe('inline');
    expect(mocks.downloadUnipileMessageAttachment).not.toHaveBeenCalled();
  });

  it('skips other, unavailable and oversized attachments', async () => {
    await expect(
      importAttachments({
        attachments: [
          { id: 'file-1', type: 'file', mimetype: 'application/pdf' },
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
    ).resolves.toEqual({ files: [], importedCount: 0 });
    expect(mocks.downloadUnipileMessageAttachment).not.toHaveBeenCalled();
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
    ).resolves.toEqual({ files: [], importedCount: 0 });
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

    expect(files.map(({ attachmentId }) => attachmentId)).toEqual(['img-2']);
  });

  it('skips the remaining files once the deadline is reached', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(Date.parse('2026-10-29T08:00:00.000Z'));
    mocks.downloadUnipileMessageAttachment.mockImplementation(async () => {
      vi.advanceTimersByTime(2_000);

      return Buffer.from('downloaded');
    });

    try {
      const { files, importedCount } = await importAttachments({
        attachments: [
          { id: 'img-1', type: 'img', mimetype: 'image/png' },
          { id: 'img-2', type: 'img', mimetype: 'image/png' },
        ],
        deadlineAtMs: Date.now() + 1_000,
      });

      expect(importedCount).toBe(1);
      expect(files.map(({ attachmentId }) => attachmentId)).toEqual(['img-1']);
      expect(mocks.downloadUnipileMessageAttachment).toHaveBeenCalledOnce();
    } finally {
      vi.useRealTimers();
    }
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
