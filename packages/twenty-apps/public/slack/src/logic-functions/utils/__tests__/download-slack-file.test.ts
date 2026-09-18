import { afterEach, describe, expect, it, vi } from 'vitest';

import { downloadSlackFile } from 'src/logic-functions/utils/download-slack-file';

const PNG_BYTES = new Uint8Array([137, 80, 78, 71]);

const streamOf = (
  chunks: Uint8Array<ArrayBuffer>[],
): ReadableStream<Uint8Array<ArrayBuffer>> =>
  new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(chunk);
      }
      controller.close();
    },
  });

const mockFetchResponse = (response: Partial<Response>) => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'image/png' }),
      body: streamOf([PNG_BYTES]),
      ...response,
    }),
  );
};

const downloadPngFile = async () =>
  await downloadSlackFile({
    urlPrivate: 'https://files.slack.com/screenshot.png',
    mimeType: 'image/png',
    botToken: 'xoxb-token',
    timeoutMs: 20_000,
  });

describe('downloadSlackFile', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should send the bot token as a bearer header', async () => {
    mockFetchResponse({});

    await downloadPngFile();

    expect(fetch).toHaveBeenCalledWith(
      'https://files.slack.com/screenshot.png',
      expect.objectContaining({
        headers: { Authorization: 'Bearer xoxb-token' },
      }),
    );
  });

  it('should return the bytes when Slack serves the file', async () => {
    mockFetchResponse({});

    const result = await downloadPngFile();

    expect(result).toEqual({
      success: true,
      bytes: PNG_BYTES,
      contentType: 'image/png',
    });
  });

  it('should fail when Slack answers the sign-in page instead of the file', async () => {
    mockFetchResponse({
      headers: new Headers({ 'content-type': 'text/html; charset=utf-8' }),
    });

    const result = await downloadPngFile();

    expect(result.success).toBe(false);
    expect(result).toHaveProperty(
      'error',
      expect.stringContaining('files:read'),
    );
  });

  it('should fail on a non-ok response', async () => {
    mockFetchResponse({ ok: false, status: 404 });

    const result = await downloadPngFile();

    expect(result).toEqual({ success: false, error: 'status 404' });
  });

  it('should fail when the fetch itself throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('timed out')));

    const result = await downloadPngFile();

    expect(result).toEqual({ success: false, error: 'timed out' });
  });

  it('should refuse an oversized file on its content length without reading it', async () => {
    const cancel = vi.fn().mockResolvedValue(undefined);

    mockFetchResponse({
      headers: new Headers({
        'content-type': 'image/png',
        'content-length': String(11 * 1024 * 1024),
      }),
      body: { cancel } as unknown as ReadableStream<Uint8Array<ArrayBuffer>>,
    });

    const result = await downloadPngFile();

    expect(result.success).toBe(false);
    expect(result).toHaveProperty('error', expect.stringContaining('limit'));
    expect(cancel).toHaveBeenCalled();
  });

  it('should stop reading a body that grows past the limit without a content length', async () => {
    const megabyte = new Uint8Array(1024 * 1024);
    let enqueuedChunks = 0;

    mockFetchResponse({
      body: new ReadableStream<Uint8Array<ArrayBuffer>>({
        pull(controller) {
          enqueuedChunks += 1;
          controller.enqueue(megabyte);
        },
      }),
    });

    const result = await downloadPngFile();

    expect(result.success).toBe(false);
    expect(result).toHaveProperty('error', expect.stringContaining('limit'));
    expect(enqueuedChunks).toBeLessThan(14);
  });
});
