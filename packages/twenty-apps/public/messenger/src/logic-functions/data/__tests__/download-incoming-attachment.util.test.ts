import { afterEach, describe, expect, it, vi } from 'vitest';

import { MESSENGER_ATTACHMENT_MAX_SIZE_BYTES } from 'src/constants/messenger-attachment-max-size-bytes.constant';
import { downloadIncomingAttachment } from 'src/logic-functions/data/download-incoming-attachment.util';

const MAX_SIZE_BYTES = MESSENGER_ATTACHMENT_MAX_SIZE_BYTES.other;

const mockFetchResponse = (response: Response) =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(response);

const buildStream = (chunks: Uint8Array[]) =>
  new ReadableStream<Uint8Array>({
    start(controller) {
      chunks.forEach((chunk) => controller.enqueue(chunk));
      controller.close();
    },
  });

describe('downloadIncomingAttachment', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the file content', async () => {
    mockFetchResponse(new Response(buildStream([new Uint8Array([1, 2, 3])])));

    const content = await downloadIncomingAttachment(
      'https://cdn.example/a.jpg',
    );

    expect(content).toEqual(Buffer.from([1, 2, 3]));
  });

  it('skips a file whose declared size is over the limit', async () => {
    mockFetchResponse(
      new Response('x', {
        headers: { 'content-length': String(MAX_SIZE_BYTES + 1) },
      }),
    );

    expect(
      await downloadIncomingAttachment('https://cdn.example/a.mp4'),
    ).toBeUndefined();
  });

  it('stops reading once the file goes over the limit', async () => {
    const halfLimitChunk = new Uint8Array(MAX_SIZE_BYTES / 2 + 1);

    mockFetchResponse(
      new Response(buildStream([halfLimitChunk, halfLimitChunk])),
    );

    expect(
      await downloadIncomingAttachment('https://cdn.example/a.mp4'),
    ).toBeUndefined();
  });

  it('throws when the download fails', async () => {
    mockFetchResponse(new Response('', { status: 403 }));

    await expect(
      downloadIncomingAttachment('https://cdn.example/a.jpg'),
    ).rejects.toThrow('Downloading a Messenger attachment failed (403)');
  });
});
