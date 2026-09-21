import { parseCssString } from '../parseCssString';

describe('parseCssString', () => {
  it('should return undefined when the input is not a non-empty string', () => {
    expect(parseCssString(undefined)).toBeUndefined();
    expect(parseCssString('')).toBeUndefined();
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

  it('should keep semicolons inside url() values', () => {
    expect(
      parseCssString(
        'background-image: url(data:image/png;base64,abc); color: red',
      ),
    ).toEqual({
      backgroundImage: 'url(data:image/png;base64,abc)',
      color: 'red',
    });
  });

  it('should strip an important priority from values', () => {
    expect(parseCssString('color: red !important; width: 10px')).toEqual({
      color: 'red',
      width: '10px',
    });
  });

  it('should keep an earlier important declaration over a later normal duplicate', () => {
    expect(parseCssString('color: red !important; color: blue')).toEqual({
      color: 'red',
    });
  });
});
