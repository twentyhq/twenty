import { installCssNamespacePolyfill } from '../installCssNamespacePolyfill';

type CssNamespace = {
  escape: (...escapeArguments: unknown[]) => string;
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
  });

  it('should throw a TypeError when escape or supports is called without an argument', () => {
    const globalScope: Record<string, unknown> = { window: {} };

    installCssNamespacePolyfill(globalScope);

    const cssNamespace = globalScope.CSS as CssNamespace;

    expect(() => cssNamespace.escape()).toThrow(TypeError);
    expect(() => cssNamespace.supports()).toThrow(TypeError);
  });

  it('should never throw on unstringifiable supports arguments', () => {
    const globalScope: Record<string, unknown> = { window: {} };

    installCssNamespacePolyfill(globalScope);

    const cssNamespace = globalScope.CSS as CssNamespace;

    expect(cssNamespace.supports(Symbol('display'))).toBe(false);
  });

  it('should alias an existing CSS namespace onto the window instead of shadowing it', () => {
    const existingCssNamespace = { escape: () => 'existing' };
    const polyfillWindow: Record<string, unknown> = {};
    const globalScope: Record<string, unknown> = {
      window: polyfillWindow,
      CSS: existingCssNamespace,
    };

    installCssNamespacePolyfill(globalScope);

    expect(globalScope.CSS).toBe(existingCssNamespace);
    expect(polyfillWindow.CSS).toBe(existingCssNamespace);
  });
});
