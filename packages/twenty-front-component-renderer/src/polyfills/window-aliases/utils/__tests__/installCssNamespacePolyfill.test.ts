import { installCssNamespacePolyfill } from '../installCssNamespacePolyfill';

type CssNamespace = {
  escape: (value: unknown) => string;
  supports: (...supportsArguments: unknown[]) => boolean;
};

describe('installCssNamespacePolyfill', () => {
  it('should define the CSS namespace on both the global scope and a distinct window', () => {
    const polyfillWindow: Record<string, unknown> = {};
    const globalScope: Record<string, unknown> = { window: polyfillWindow };

    installCssNamespacePolyfill(globalScope);

    expect(globalScope.CSS).toBeDefined();
    expect(polyfillWindow.CSS).toBe(globalScope.CSS);

    const cssNamespace = globalScope.CSS as CssNamespace;

    expect(cssNamespace.escape('.foo#bar')).toBe('\\.foo\\#bar');
    expect(cssNamespace.supports('display', 'flex')).toBe(true);
    expect(cssNamespace.supports('made-up-property', 'anything')).toBe(false);
    expect(cssNamespace.supports()).toBe(false);
  });

  it('should never throw on unstringifiable supports arguments', () => {
    const globalScope: Record<string, unknown> = { window: {} };

    installCssNamespacePolyfill(globalScope);

    const cssNamespace = globalScope.CSS as CssNamespace;

    expect(cssNamespace.supports(Symbol('display'))).toBe(false);
  });

  it('should not overwrite an existing CSS namespace', () => {
    const existingCssNamespace = { escape: () => 'existing' };
    const globalScope: Record<string, unknown> = {
      window: {},
      CSS: existingCssNamespace,
    };

    installCssNamespacePolyfill(globalScope);

    expect(globalScope.CSS).toBe(existingCssNamespace);
    expect((globalScope.window as Record<string, unknown>).CSS).toBeDefined();
    expect((globalScope.window as Record<string, unknown>).CSS).not.toBe(
      existingCssNamespace,
    );
  });
});
