import { resolveStyleStoreKeyFromPropertyName } from '../resolveStyleStoreKeyFromPropertyName';

describe('resolveStyleStoreKeyFromPropertyName', () => {
  it('should convert a camelCase property name to kebab-case', () => {
    expect(resolveStyleStoreKeyFromPropertyName('backgroundColor')).toBe(
      'background-color',
    );
  });

  it('should preserve a custom property name verbatim', () => {
    expect(resolveStyleStoreKeyFromPropertyName('--myVar')).toBe('--myVar');
  });

  it('should map the cssFloat alias to the float property', () => {
    expect(resolveStyleStoreKeyFromPropertyName('cssFloat')).toBe('float');
  });

  it('should not resolve Object.prototype keys to inherited values', () => {
    expect(resolveStyleStoreKeyFromPropertyName('constructor')).toBe(
      'constructor',
    );
    expect(resolveStyleStoreKeyFromPropertyName('__proto__')).toBe('__proto__');
  });
});
