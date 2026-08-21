import { Window } from '@remote-dom/polyfill';

import { installWindowAliasesPolyfill } from '@/polyfills/window-aliases/utils/installWindowAliasesPolyfill';

const createSandbox = () => {
  const polyfillWindow = new Window() as unknown as Record<string, unknown>;
  const globalScope: Record<string, unknown> = {
    window: polyfillWindow,
    console,
    crypto,
    performance,
    fetch: jest.fn(),
    queueMicrotask,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    structuredClone,
    btoa,
    atob,
    AbortController,
    Headers,
    URL,
  };

  installWindowAliasesPolyfill({ globalScope });

  return { globalScope, polyfillWindow };
};

describe('installWindowAliasesPolyfill', () => {
  it('should expose the aliased natives on the remote-dom window', () => {
    const { polyfillWindow } = createSandbox();

    for (const aliasName of [
      'requestAnimationFrame',
      'cancelAnimationFrame',
      'requestIdleCallback',
      'cancelIdleCallback',
      'fetch',
      'console',
      'crypto',
      'performance',
      'queueMicrotask',
      'setTimeout',
      'structuredClone',
      'btoa',
      'AbortController',
      'Headers',
      'URL',
    ]) {
      expect(polyfillWindow[aliasName]).toBeDefined();
    }
  });

  it('should reach the fetch swapped onto the global scope after install', async () => {
    const { globalScope, polyfillWindow } = createSandbox();

    const proxiedFetch = jest.fn().mockResolvedValue({ status: 200 });
    globalScope.fetch = proxiedFetch;

    await (polyfillWindow.fetch as typeof fetch)('https://api.twenty.com');

    expect(proxiedFetch).toHaveBeenCalledWith('https://api.twenty.com');
    expect(proxiedFetch.mock.contexts[0]).toBe(globalScope);
  });

  it('should not overwrite the properties the remote-dom window already owns', () => {
    const { polyfillWindow } = createSandbox();

    expect(polyfillWindow.window).toBe(polyfillWindow);
    expect(polyfillWindow.self).toBe(polyfillWindow);
    expect(polyfillWindow.document).toBeDefined();
  });
});
