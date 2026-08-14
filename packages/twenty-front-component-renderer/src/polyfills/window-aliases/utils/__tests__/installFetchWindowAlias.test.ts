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

  it('should throw a TypeError when no global fetch exists at call time', () => {
    const polyfillWindow: Record<string, unknown> = {};
    const globalScope: Record<string, unknown> = { window: polyfillWindow };

    installFetchWindowAlias(globalScope);

    const windowFetch = polyfillWindow.fetch as typeof fetch;

    expect(() => windowFetch('https://api.twenty.com')).toThrow(TypeError);
  });
});
