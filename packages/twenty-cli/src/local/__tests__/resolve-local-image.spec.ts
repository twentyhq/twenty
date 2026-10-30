import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getEngineVersionRange } from '@/app/manifest/get-engine-version-range';
import { getLocalImage, resolveLocalImage } from '@/local/resolve-local-image';
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
  it('uses an explicit version without consulting the registry or app range', async () => {
    vi.mocked(getEngineVersionRange).mockReturnValue('^1.0.0');
    expect(await resolveLocalImage('2.53.1', signal)).toBe(
      'twentycrm/twenty-app-dev:v2.53.1',
    );
    expect(fetchWithProxy).not.toHaveBeenCalled();
  });

  it('uses latest outside an app', async () => {
    expect(await resolveLocalImage(undefined, signal)).toBe(
      'twentycrm/twenty-app-dev:latest',
    );
    expect(fetchWithProxy).not.toHaveBeenCalled();
  });

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
    expect(await resolveLocalImage(undefined, signal)).toBe(
      'twentycrm/twenty-app-dev:v2.53.1',
    );
  });

  it.each(['unavailable', 'incompatible'])(
    'never falls back to latest when range selection is %s',
    async (failure) => {
      vi.mocked(getEngineVersionRange).mockReturnValue('^2.52.0');
      if (failure === 'unavailable')
        vi.mocked(fetchWithProxy).mockRejectedValue(new Error('Offline'));
      else
        vi.mocked(fetchWithProxy).mockResolvedValue(
          Response.json({ results: [{ name: 'v1.0.0' }], next: null }),
        );
      await expect(resolveLocalImage(undefined, signal)).rejects.toMatchObject({
        code: 'LOCAL_ENVIRONMENT_FAILED',
      });
    },
  );

  it('rejects an invalid app range before sending a request', async () => {
    vi.mocked(getEngineVersionRange).mockReturnValue('invalid');
    await expect(resolveLocalImage(undefined, signal)).rejects.toMatchObject({
      code: 'INVALID_INPUT',
    });
    expect(fetchWithProxy).not.toHaveBeenCalled();
  });

  it.each(['other/image:tag', '--privileged', 'latest; touch /tmp/file'])(
    'rejects invalid image tag %s',
    (tag) => {
      expect(() => getLocalImage(tag)).toThrow();
    },
  );
});
