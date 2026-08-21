import { NATIVE_FUNCTION_WINDOW_ALIAS_NAMES } from '@/polyfills/window-aliases/constants/NativeFunctionWindowAliasNames';
import { installLiveWindowAliases } from '../installLiveWindowAliases';

describe('installLiveWindowAliases', () => {
  it('should bind every aliased function to the global scope', () => {
    const receivedThisValues: unknown[] = [];
    const polyfillWindow: Record<string, unknown> = {};
    const globalScope: Record<string, unknown> = { window: polyfillWindow };

    for (const aliasName of NATIVE_FUNCTION_WINDOW_ALIAS_NAMES) {
      globalScope[aliasName] = function (this: unknown) {
        receivedThisValues.push(this);
      };
    }

    installLiveWindowAliases(globalScope);

    for (const aliasName of NATIVE_FUNCTION_WINDOW_ALIAS_NAMES) {
      (polyfillWindow[aliasName] as () => void)();
    }

    expect(receivedThisValues).toEqual(
      NATIVE_FUNCTION_WINDOW_ALIAS_NAMES.map(() => globalScope),
    );
  });

  it('should resolve a global replaced after install', () => {
    const polyfillWindow: Record<string, unknown> = {};
    const globalScope: Record<string, unknown> = {
      window: polyfillWindow,
      fetch: jest.fn().mockResolvedValue('initial'),
    };

    installLiveWindowAliases(globalScope);

    const proxiedResponse = { status: 200 };
    const proxiedFetch = jest.fn().mockResolvedValue(proxiedResponse);
    globalScope.fetch = proxiedFetch;

    return (polyfillWindow.fetch as typeof fetch)(
      'https://api.twenty.com/graphql',
    ).then((response) => {
      expect(response).toBe(proxiedResponse);
      expect(proxiedFetch.mock.contexts[0]).toBe(globalScope);
    });
  });

  it('should keep a stable identity while the underlying native is unchanged', () => {
    const polyfillWindow: Record<string, unknown> = {};
    const globalScope: Record<string, unknown> = {
      window: polyfillWindow,
      setTimeout: jest.fn(),
    };

    installLiveWindowAliases(globalScope);

    const firstRead = polyfillWindow.setTimeout;

    expect(polyfillWindow.setTimeout).toBe(firstRead);

    globalScope.setTimeout = jest.fn();

    expect(polyfillWindow.setTimeout).not.toBe(firstRead);
  });

  it('should alias namespaces and constructors by reference rather than binding them', () => {
    const consoleAlias = { log: () => {} };
    const polyfillWindow: Record<string, unknown> = {};
    const globalScope: Record<string, unknown> = {
      window: polyfillWindow,
      AbortController,
      console: consoleAlias,
      performance,
    };

    installLiveWindowAliases(globalScope);

    expect(polyfillWindow.AbortController).toBe(AbortController);
    expect(polyfillWindow.console).toBe(consoleAlias);
    expect(polyfillWindow.performance).toBe(performance);
  });

  it('should mirror a write onto the global scope, like a real window', () => {
    const polyfillWindow: Record<string, unknown> = {};
    const globalScope: Record<string, unknown> = {
      window: polyfillWindow,
      setTimeout: jest.fn(),
    };

    installLiveWindowAliases(globalScope);

    const instrumentedSetTimeout = jest.fn();
    polyfillWindow.setTimeout = instrumentedSetTimeout;

    expect(globalScope.setTimeout).toBe(instrumentedSetTimeout);
  });

  it('should not overwrite a name the window already owns', () => {
    const existingSetTimeout = jest.fn();
    const polyfillWindow: Record<string, unknown> = {
      setTimeout: existingSetTimeout,
    };
    const globalScope: Record<string, unknown> = {
      window: polyfillWindow,
      setTimeout: jest.fn(),
    };

    installLiveWindowAliases(globalScope);

    expect(polyfillWindow.setTimeout).toBe(existingSetTimeout);
  });

  it('should expose nothing for a native the global scope does not have', () => {
    const polyfillWindow: Record<string, unknown> = {};
    const globalScope: Record<string, unknown> = { window: polyfillWindow };

    installLiveWindowAliases(globalScope);

    expect(polyfillWindow.fetch).toBeUndefined();
  });
});
