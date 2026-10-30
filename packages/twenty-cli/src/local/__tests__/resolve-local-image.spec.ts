import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getEngineVersionRange } from '@/app/manifest/get-engine-version-range';
import { resolveLocalImage } from '@/local/resolve-local-image';
import { fetchWithProxy } from '@/transport/fetch-with-proxy';

vi.mock('@/app/manifest/get-engine-version-range', () => ({
  getEngineVersionRange: vi.fn(),
}));
vi.mock('@/transport/fetch-with-proxy', () => ({ fetchWithProxy: vi.fn() }));
const signal = new AbortController().signal;

beforeEach(() => {
  vi.mocked(getEngineVersionRange).mockReturnValue(null);
});
afterEach(() => {
  vi.resetAllMocks();
});

describe('local image selection', () => {
  it('selects the highest compatible published version across pages', async () => {
    vi.mocked(getEngineVersionRange).mockReturnValue('^2.52.0');
    vi.mocked(fetchWithProxy)
      .mockResolvedValueOnce(
        Response.json({
          results: [
            { name: 'v2.52.0' },
            { name: 'latest' },
            { name: 'v3.0.0' },
          ],
          next: 'next',
        }),
      )
      .mockResolvedValueOnce(
        Response.json({
          results: [{ name: 'v2.53.1' }, { name: 'v2.54.0-beta.1' }],
          next: null,
        }),
      );
    expect(await resolveLocalImage({ version: undefined, signal })).toBe(
      'twentycrm/twenty-app-dev:v2.53.1',
    );
  });

  it.each([
    {
      failure: 'network failure',
      response: () => Promise.reject(new Error('Offline')),
      reason: 'Offline',
    },
    {
      failure: 'rate limit',
      response: () => Promise.resolve(new Response(null, { status: 429 })),
      reason: 'Image registry request failed (HTTP 429)',
    },
    {
      failure: 'malformed response',
      response: () => Promise.resolve(Response.json({ results: null })),
      reason: 'Invalid image registry response',
    },
    {
      failure: 'no compatible version',
      response: () =>
        Promise.resolve(
          Response.json({ results: [{ name: 'v1.0.0' }], next: null }),
        ),
      reason: 'No published image matches engines.twenty',
    },
  ])(
    'reports $failure instead of falling back to latest',
    async ({ response, reason }) => {
      vi.mocked(getEngineVersionRange).mockReturnValue('^2.52.0');
      vi.mocked(fetchWithProxy).mockImplementation(response);
      await expect(
        resolveLocalImage({ version: undefined, signal }),
      ).rejects.toMatchObject({
        code: 'LOCAL_ENVIRONMENT_FAILED',
        message: `Could not select a published Twenty image matching ^2.52.0: ${reason}`,
        cause: expect.any(Error),
      });
    },
  );

  it('rejects an invalid app range before sending a request', async () => {
    vi.mocked(getEngineVersionRange).mockReturnValue('invalid');
    await expect(
      resolveLocalImage({ version: undefined, signal }),
    ).rejects.toMatchObject({
      code: 'INVALID_INPUT',
    });
    expect(fetchWithProxy).not.toHaveBeenCalled();
  });
});
