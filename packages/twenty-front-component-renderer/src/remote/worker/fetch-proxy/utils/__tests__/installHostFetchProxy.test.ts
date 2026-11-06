/**
 * @jest-environment node
 */
import { type HostFetchFunction } from '@/types/HostFetchFunction';
import { installHostFetchProxy } from '../installHostFetchProxy';

const originalFetch = globalThis.fetch;

describe('installHostFetchProxy', () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('should route proxied origins through the host fetch bridge', async () => {
    const nativeFetch = jest.fn(async () => new Response('native'));
    globalThis.fetch = nativeFetch;

    const hostFetch: HostFetchFunction = jest.fn(async () => ({
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'application/json' },
      body: 'proxied',
    }));

    installHostFetchProxy(hostFetch, ['https://api.twenty.test']);

    const response = await fetch('https://api.twenty.test/graphql', {
      method: 'POST',
      body: '{"query":"{ me }"}',
    });

    expect(hostFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://api.twenty.test/graphql',
        method: 'POST',
        body: '{"query":"{ me }"}',
      }),
    );
    expect(nativeFetch).not.toHaveBeenCalled();
    expect(await response.text()).toBe('proxied');
  });

  it('should pass non-proxied origins through to the native fetch', async () => {
    const nativeFetch = jest.fn(async () => new Response('native'));
    globalThis.fetch = nativeFetch;

    const hostFetch: HostFetchFunction = jest.fn(async () => ({
      status: 200,
      statusText: 'OK',
      headers: {},
      body: 'proxied',
    }));

    installHostFetchProxy(hostFetch, ['https://api.twenty.test']);

    const response = await fetch('https://cdn.public.test/chart.js');

    expect(nativeFetch).toHaveBeenCalled();
    expect(hostFetch).not.toHaveBeenCalled();
    expect(await response.text()).toBe('native');
  });
});
