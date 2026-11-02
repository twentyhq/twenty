import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ getAttachment: vi.fn() }));

vi.mock('@unipile/sdk', () => ({
  UnipileMessaging: class {
    getAttachment = mocks.getAttachment;
  },
}));

vi.mock('src/unipile/utils/get-unipile-request-options.util', () => ({
  getUnipileRequestOptions: () => ({ auth: 'key', throwOnError: true }),
}));

const { downloadUnipileMessageAttachment } =
  await import('src/unipile/utils/download-unipile-message-attachment.util');

const streamOf = ({
  chunks,
  onCancel,
}: {
  chunks: string[];
  onCancel?: () => void;
}) =>
  new ReadableStream<Uint8Array>({
    start(controller) {
      chunks.forEach((chunk) => controller.enqueue(Buffer.from(chunk)));
      controller.close();
    },
    cancel: onCancel,
  });

const download = (maxSizeBytes: number) =>
  downloadUnipileMessageAttachment({
    accountId: 'acc_1',
    chatId: 'chat-1',
    messageId: 'message-1',
    attachmentId: 'attachment-1',
    maxSizeBytes,
    deadlineAtMs: Date.now() + 60_000,
  });

describe('downloadUnipileMessageAttachment', () => {
  beforeEach(() => {
    mocks.getAttachment.mockReset();
  });

  it('returns the downloaded file', async () => {
    mocks.getAttachment.mockResolvedValue({
      data: streamOf({ chunks: ['ab', 'cd'] }),
    });

    await expect(download(10)).resolves.toEqual(Buffer.from('abcd'));
    expect(mocks.getAttachment).toHaveBeenCalledWith(
      expect.objectContaining({
        parseAs: 'stream',
        signal: expect.any(AbortSignal),
        path: {
          account_id: 'acc_1',
          chat_id: 'chat-1',
          message_id: 'message-1',
          attachment_id: 'attachment-1',
        },
      }),
    );
  });

  it('stops a download that goes over the size limit', async () => {
    const onCancel = vi.fn();

    mocks.getAttachment.mockResolvedValue({
      data: streamOf({ chunks: ['abc', 'def', 'ghi'], onCancel }),
    });

    await expect(download(4)).rejects.toThrow('larger than 4 bytes');
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
