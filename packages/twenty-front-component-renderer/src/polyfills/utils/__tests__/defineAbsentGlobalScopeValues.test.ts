import { defineAbsentGlobalScopeValues } from '../defineAbsentGlobalScopeValues';

describe('defineAbsentGlobalScopeValues', () => {
  it('should define absent values on the global scope and a distinct window', () => {
    const polyfillWindow: Record<string, unknown> = {};
    const globalScope: Record<string, unknown> = { window: polyfillWindow };

    defineAbsentGlobalScopeValues({
      globalScope,
      values: { installedValue: 'installed' },
    });

    expect(globalScope.installedValue).toBe('installed');
    expect(polyfillWindow.installedValue).toBe('installed');
  });

  it('should leave a name a target inherits from its prototype alone', () => {
    const polyfillWindow: Record<string, unknown> = Object.create({
      inheritedNative: 'from prototype',
    });
    const globalScope: Record<string, unknown> = { window: polyfillWindow };

    defineAbsentGlobalScopeValues({
      globalScope,
      values: { inheritedNative: 'from polyfill' },
    });

    expect(polyfillWindow.inheritedNative).toBe('from prototype');
    expect(globalScope.inheritedNative).toBe('from polyfill');
  });
});
