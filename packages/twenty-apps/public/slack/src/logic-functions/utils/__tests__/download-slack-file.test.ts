import { afterEach, describe, expect, it, vi } from 'vitest';

import { downloadSlackFile } from 'src/logic-functions/utils/download-slack-file';

const PNG_BYTES = new Uint8Array([137, 80, 78, 71]);

const mockFetchResponse = (response: Partial<Response>) => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'image/png' }),
      arrayBuffer: async () => PNG_BYTES.buffer,
      ...response,
    }),
  );
};

const downloadPngFile = async () =>
  await downloadSlackFile({
    urlPrivate: 'https://files.slack.com/screenshot.png',
    mimeType: 'image/png',
    botToken: 'xoxb-token',
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

    const result = await downloadSlackFile({
      urlPrivate: 'https://files.slack.com/screenshot.png',
      mimeType: 'image/png',
      botToken: 'xoxb-token',
    });

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

  it('should reject a body larger than the size limit', async () => {
    mockFetchResponse({
      arrayBuffer: async () => new Uint8Array(11 * 1024 * 1024).buffer,
    });

    const result = await downloadPngFile();

    expect(result.success).toBe(false);
    expect(result).toHaveProperty('error', expect.stringContaining('over the'));
  });
});
