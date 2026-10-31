import { beforeEach, describe, expect, it, vi } from 'vitest';

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

const importAttachments = (attachments: UnipileMessageAttachment[]) =>
  importLinkedinMessageAttachments({
    unipileAccountId: 'acc_1',
    messages: [buildMessage(attachments)],
  });

describe('importLinkedinMessageAttachments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    mocks.downloadUnipileMessageAttachment.mockResolvedValue(
      Buffer.from('downloaded'),
    );
  });

  it('downloads images, videos and audio', async () => {
    const files = await importAttachments([
      { id: 'img-1', type: 'img', mimetype: 'image/jpeg' },
      { id: 'video-1', type: 'video', mimetype: 'video/mp4' },
      { id: 'audio-1', type: 'audio', mimetype: 'audio/mpeg' },
    ]);

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
    });
    expect(files[0]).toMatchObject({
      messageExternalId: 'message-1',
      mimeType: 'image/jpeg',
      content: Buffer.from('downloaded'),
    });
  });

  it('uses the inline content instead of downloading it', async () => {
    const [file] = await importAttachments([
      {
        id: 'img-1',
        type: 'img',
        mimetype: 'image/png',
        content: Buffer.from('inline').toString('base64'),
      },
    ]);

    expect(file?.content.toString()).toBe('inline');
    expect(mocks.downloadUnipileMessageAttachment).not.toHaveBeenCalled();
  });

  it('skips other, unavailable and oversized attachments', async () => {
    await expect(
      importAttachments([
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
      ]),
    ).resolves.toEqual([]);
    expect(mocks.downloadUnipileMessageAttachment).not.toHaveBeenCalled();
  });

  it('drops a file that fails to download and keeps the others', async () => {
    mocks.downloadUnipileMessageAttachment.mockRejectedValueOnce(
      new Error('Unipile download message attachment failed (404)'),
    );

    const files = await importAttachments([
      { id: 'img-1', type: 'img', mimetype: 'image/png' },
      { id: 'img-2', type: 'img', mimetype: 'image/png' },
    ]);

    expect(files.map(({ attachmentId }) => attachmentId)).toEqual(['img-2']);
  });

  it('lets a rate limit through so the import can pause', async () => {
    mocks.downloadUnipileMessageAttachment.mockRejectedValue(
      new UnipileRateLimitError('rate limited', 3600),
    );

    await expect(
      importAttachments([{ id: 'img-1', type: 'img', mimetype: 'image/png' }]),
    ).rejects.toBeInstanceOf(UnipileRateLimitError);
  });
});
