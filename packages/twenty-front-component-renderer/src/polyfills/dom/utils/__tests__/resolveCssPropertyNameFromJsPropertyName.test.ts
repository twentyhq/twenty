import { resolveCssPropertyNameFromJsPropertyName } from '../resolveCssPropertyNameFromJsPropertyName';

describe('resolveCssPropertyNameFromJsPropertyName', () => {
  it('should convert a camelCase property name to kebab-case', () => {
    expect(resolveCssPropertyNameFromJsPropertyName('backgroundColor')).toBe(
      'background-color',
    );
  });

  it('should preserve a custom property name verbatim', () => {
    expect(resolveCssPropertyNameFromJsPropertyName('--myVar')).toBe('--myVar');
  });

  it('should map the cssFloat alias to the float property', () => {
    expect(resolveCssPropertyNameFromJsPropertyName('cssFloat')).toBe('float');
  });

  it('should not resolve Object.prototype keys to inherited values', () => {
    expect(resolveCssPropertyNameFromJsPropertyName('constructor')).toBe(
      'constructor',
    );
    expect(resolveCssPropertyNameFromJsPropertyName('__proto__')).toBe(
      '__proto__',
    );
  });
});
