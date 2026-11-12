import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { downloadSendMessageAttachment } from 'src/logic-functions/utils/download-send-message-attachment.util';

const ATTACHMENT = {
  filename: 'deck.pdf',
  contentType: 'application/pdf',
  size: 6,
  downloadUrl: 'https://twenty.example/file/email-attachment/file-1?token=t',
};

const fetchMock = vi.fn();

const download = (maxSizeBytes = 1024) =>
  downloadSendMessageAttachment({
    attachment: ATTACHMENT,
    maxSizeBytes,
    deadlineAtMs: Date.now() + 10_000,
  });

describe('downloadSendMessageAttachment', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('downloads the file and encodes it for Unipile', async () => {
    fetchMock.mockResolvedValue(new Response('report'));

    await expect(download()).resolves.toEqual({
      content: Buffer.from('report').toString('base64'),
      content_type: 'application/pdf',
      filename: 'deck.pdf',
    });
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(ATTACHMENT.downloadUrl, {
      signal: expect.any(AbortSignal),
    });
  });

  it('refuses a file announced above the size limit without downloading it', async () => {
    await expect(download(5)).rejects.toThrow(
      'Attachment deck.pdf is larger than 5 bytes',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('stops a download that grows past the size limit', async () => {
    fetchMock.mockResolvedValue(new Response('a much longer report'));

    await expect(download(10)).rejects.toThrow(
      'Attachment is larger than 10 bytes',
    );
  });

  it('fails when the file cannot be downloaded', async () => {
    fetchMock.mockResolvedValue(new Response('Forbidden', { status: 403 }));

    await expect(download()).rejects.toThrow(
      'Downloading attachment deck.pdf failed (403)',
    );
  });
});
