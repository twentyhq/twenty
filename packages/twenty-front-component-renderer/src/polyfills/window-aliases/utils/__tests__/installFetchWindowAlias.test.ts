import { installFetchWindowAlias } from '../installFetchWindowAlias';

describe('installFetchWindowAlias', () => {
  it('should delegate window.fetch to the fetch swapped in after install', async () => {
    const initialFetch = jest.fn().mockResolvedValue('initial');
    const polyfillWindow: Record<string, unknown> = {};
    const globalScope: Record<string, unknown> = {
      window: polyfillWindow,
      fetch: initialFetch,
    };

    installFetchWindowAlias(globalScope);

    const proxiedResponse = { status: 200 };
    const proxiedFetch = jest.fn().mockResolvedValue(proxiedResponse);
    globalScope.fetch = proxiedFetch;

    const windowFetch = polyfillWindow.fetch as typeof fetch;
    const response = await windowFetch('https://api.twenty.com/graphql', {
      method: 'POST',
    });

    expect(response).toBe(proxiedResponse);
    expect(proxiedFetch).toHaveBeenCalledWith(
      'https://api.twenty.com/graphql',
      {
        method: 'POST',
      },
    );
    expect(initialFetch).not.toHaveBeenCalled();
  });

  it('should leave the global scope fetch untouched', () => {
    const initialFetch = jest.fn();
    const globalScope: Record<string, unknown> = {
      window: {},
      fetch: initialFetch,
    };

    installFetchWindowAlias(globalScope);

    expect(globalScope.fetch).toBe(initialFetch);
  });

  it('should reject with a TypeError when no global fetch exists at call time', async () => {
    const polyfillWindow: Record<string, unknown> = {};
    const globalScope: Record<string, unknown> = { window: polyfillWindow };

    installFetchWindowAlias(globalScope);

    const windowFetch = polyfillWindow.fetch as typeof fetch;

    await expect(windowFetch('https://api.twenty.com')).rejects.toThrow(
      TypeError,
    );
  });

  it('should leave a window fetch that is already defined untouched', () => {
    const existingWindowFetch = jest.fn();
    const polyfillWindow: Record<string, unknown> = {
      fetch: existingWindowFetch,
    };
    const globalScope: Record<string, unknown> = {
      window: polyfillWindow,
      fetch: jest.fn(),
    };

    installFetchWindowAlias(globalScope);

    expect(polyfillWindow.fetch).toBe(existingWindowFetch);
  });
});
