import { afterEach, expect, it, vi } from 'vitest';

import { fetchWithProxy } from '@/transport/fetch-with-proxy';

vi.mock('undici', () => {
  throw new Error('Proxy tooling must not load without a proxy setting');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

it('uses native fetch without loading proxy tooling when no proxy is configured', async () => {
  for (const name of [
    'HTTP_PROXY',
    'HTTPS_PROXY',
    'http_proxy',
    'https_proxy',
  ]) {
    vi.stubEnv(name, undefined);
  }
  const response = new Response('direct');
  const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(response);

  expect(await fetchWithProxy('https://api.example', { method: 'GET' })).toBe(
    response,
  );
  expect(fetchSpy).toHaveBeenCalledWith('https://api.example', {
    method: 'GET',
  });
});
