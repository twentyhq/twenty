import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getServerVersionFromApi } from '@/cli/utilities/version/get-server-version-from-api';

const { mockedGetConfig } = vi.hoisted(() => ({
  mockedGetConfig: vi.fn(),
}));

vi.mock('@/cli/utilities/config/config-service', () => ({
  ConfigService: class {
    getConfig = mockedGetConfig;
  },
}));

const mockFetch = (
  impl: (
    input: string,
  ) => Promise<{ ok: boolean; json: () => Promise<unknown> }>,
) => {
  global.fetch = vi.fn(impl as unknown as typeof fetch);
};

describe('getServerVersionFromApi', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetConfig.mockResolvedValue({ apiUrl: 'http://localhost:2020' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    global.fetch = originalFetch;
  });

  it('returns the version reported by the server card endpoint', async () => {
    mockFetch(async () => ({
      ok: true,
      json: async () => ({ version: '2.16.1' }),
    }));

    expect(await getServerVersionFromApi()).toBe('2.16.1');
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:2020/.well-known/mcp/server-card.json',
      expect.anything(),
    );
  });

  it('uses the provided apiUrl over the config, stripping a trailing slash', async () => {
    mockFetch(async () => ({
      ok: true,
      json: async () => ({ version: 'v2.19.0' }),
    }));

    expect(await getServerVersionFromApi('http://example.com/')).toBe('2.19.0');
    expect(mockedGetConfig).not.toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith(
      'http://example.com/.well-known/mcp/server-card.json',
      expect.anything(),
    );
  });

  it('returns null for the 0.0.0 fallback version', async () => {
    mockFetch(async () => ({
      ok: true,
      json: async () => ({ version: '0.0.0' }),
    }));

    expect(await getServerVersionFromApi()).toBeNull();
  });

  it('returns null for a non-semver version', async () => {
    mockFetch(async () => ({
      ok: true,
      json: async () => ({ version: 'latest' }),
    }));

    expect(await getServerVersionFromApi()).toBeNull();
  });

  it('returns null when the version field is missing', async () => {
    mockFetch(async () => ({ ok: true, json: async () => ({}) }));

    expect(await getServerVersionFromApi()).toBeNull();
  });

  it('returns null on a non-ok response', async () => {
    mockFetch(async () => ({ ok: false, json: async () => ({}) }));

    expect(await getServerVersionFromApi()).toBeNull();
  });

  it('returns null when the request throws', async () => {
    global.fetch = vi.fn(async () => {
      throw new Error('network error');
    }) as unknown as typeof fetch;

    expect(await getServerVersionFromApi()).toBeNull();
  });

  it('returns null when no apiUrl is configured', async () => {
    mockedGetConfig.mockResolvedValue({ apiUrl: '' });
    global.fetch = vi.fn() as unknown as typeof fetch;

    expect(await getServerVersionFromApi()).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
