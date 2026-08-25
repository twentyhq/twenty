import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  fetchPublicWebPage,
  fetchYoutubeCaptionText,
} from './public-web.connector';

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchPublicWebPage', () => {
  it('sends a browser-like User-Agent and follows redirects', async () => {
    fetchMock.mockResolvedValue({
      status: 200,
      url: 'https://acme.com/final',
      text: async () => '<title>Acme</title>',
    });

    const page = await fetchPublicWebPage('https://acme.com');

    expect(page).toMatchObject({
      url: 'https://acme.com',
      finalUrl: 'https://acme.com/final',
      status: 200,
      isTimeout: false,
      html: '<title>Acme</title>',
      errorMessage: null,
    });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.redirect).toBe('follow');
    expect(init.headers['User-Agent']).toContain('Mozilla/5.0');
  });

  it('reports a non-2xx status without throwing', async () => {
    fetchMock.mockResolvedValue({
      status: 404,
      url: 'https://acme.com/gone',
      text: async () => 'Not found',
    });

    const page = await fetchPublicWebPage('https://acme.com/gone');

    expect(page.status).toBe(404);
    expect(page.isTimeout).toBe(false);
  });

  it('flags an aborted request as a timeout', async () => {
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';
    fetchMock.mockRejectedValue(abortError);

    const page = await fetchPublicWebPage('https://slow.acme.com');

    expect(page).toMatchObject({
      status: null,
      isTimeout: true,
      html: null,
    });
    expect(page.errorMessage).toContain('aborted');
  });

  it('reports a network failure as a non-timeout error', async () => {
    fetchMock.mockRejectedValue(new Error('getaddrinfo ENOTFOUND'));

    const page = await fetchPublicWebPage('https://nope.invalid');

    expect(page).toMatchObject({ status: null, isTimeout: false, html: null });
    expect(page.errorMessage).toContain('ENOTFOUND');
  });

  it('caps the html it keeps', async () => {
    fetchMock.mockResolvedValue({
      status: 200,
      url: 'https://acme.com',
      text: async () => 'x'.repeat(500_000),
    });

    const page = await fetchPublicWebPage('https://acme.com');

    expect(page.html).toHaveLength(400_000);
  });

  it('fetches a public https URL', async () => {
    fetchMock.mockResolvedValue({
      status: 200,
      url: 'https://acme.com/',
      text: async () => '<title>Acme</title>',
    });

    const page = await fetchPublicWebPage('https://acme.com/');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(page.errorMessage).toBeNull();
  });

  it.each([
    'http://127.0.0.1:9001/x',
    'http://10.1.2.3/',
    'http://192.168.1.1/',
    'http://172.16.0.5/',
    'http://169.254.169.254/latest/meta-data',
    'http://localhost:3000/',
    'http://[::1]/',
    'http://vault.internal/secret',
    'http://printer.local/',
  ])('refuses to fetch a private address (%s)', async (url) => {
    const page = await fetchPublicWebPage(url);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(page).toMatchObject({
      url,
      status: null,
      isTimeout: false,
      html: null,
      errorMessage: 'blocked: private address',
    });
  });

  it('refuses a non-http scheme', async () => {
    const page = await fetchPublicWebPage('ftp://acme.com/dump');

    expect(fetchMock).not.toHaveBeenCalled();
    expect(page.errorMessage).toBe('blocked: private address');
  });

  it('drops the body when a redirect lands on a private address', async () => {
    const text = vi.fn();
    fetchMock.mockResolvedValue({
      status: 200,
      url: 'http://192.168.1.1/',
      text,
    });

    const page = await fetchPublicWebPage('https://acme.com/redirect');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(text).not.toHaveBeenCalled();
    expect(page).toMatchObject({
      url: 'https://acme.com/redirect',
      finalUrl: null,
      status: null,
      isTimeout: false,
      html: null,
      errorMessage: 'blocked: private address',
    });
  });
});

describe('fetchYoutubeCaptionText', () => {
  it('fetches the caption track and returns the transcript', async () => {
    fetchMock.mockResolvedValue({
      status: 200,
      url: 'https://www.youtube.com/api/timedtext?v=abc',
      text: async () =>
        '<transcript><text start="0">We rebuilt the CRM in Twenty</text></transcript>',
    });

    const captions = await fetchYoutubeCaptionText(
      '{"captionTracks":[{"baseUrl":"https://www.youtube.com/api/timedtext?v=abc"}]}',
    );

    expect(captions).toBe('We rebuilt the CRM in Twenty');
  });

  it('returns null when the watch page has no caption track', async () => {
    expect(await fetchYoutubeCaptionText('<html></html>')).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns null when the caption track cannot be read', async () => {
    fetchMock.mockRejectedValue(new Error('boom'));

    expect(
      await fetchYoutubeCaptionText(
        '{"captionTracks":[{"baseUrl":"https://www.youtube.com/api/timedtext?v=abc"}]}',
      ),
    ).toBeNull();
  });
});
