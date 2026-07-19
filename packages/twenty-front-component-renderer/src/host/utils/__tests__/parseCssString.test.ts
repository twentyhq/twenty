import { parseCssString } from '../parseCssString';

describe('parseCssString', () => {
  it('should return the input unchanged when it is not a non-empty string', () => {
    expect(parseCssString(undefined)).toBeUndefined();
    expect(parseCssString('')).toBe('');
  });

  it('should convert kebab-case properties to camelCase', () => {
    expect(parseCssString('background-color: red')).toEqual({
      backgroundColor: 'red',
    });
  });

  it('should keep custom properties as-is', () => {
    expect(parseCssString('--my-var: 1px')).toEqual({ '--my-var': '1px' });
  });

  it('should parse multiple declarations and tolerate a trailing semicolon', () => {
    expect(parseCssString('color: red; font-size: 12px;')).toEqual({
      color: 'red',
      fontSize: '12px',
    });
  });

  it('should skip declarations without a colon', () => {
    expect(parseCssString('color: red; invalid')).toEqual({ color: 'red' });
  });

  it('should only split on the first colon so values may contain colons', () => {
    expect(parseCssString('background: url(http://example.com)')).toEqual({
      background: 'url(http://example.com)',
    });
  });
});
