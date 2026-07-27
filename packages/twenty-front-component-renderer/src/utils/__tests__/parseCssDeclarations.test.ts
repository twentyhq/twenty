import { parseCssDeclarations } from '../parseCssDeclarations';

describe('parseCssDeclarations', () => {
  it('should parse declarations into property names and values', () => {
    expect(parseCssDeclarations('color: red; width: 10px')).toEqual([
      { cssPropertyName: 'color', cssValue: 'red' },
      { cssPropertyName: 'width', cssValue: '10px' },
    ]);
  });

  it('should strip an important priority from values', () => {
    expect(parseCssDeclarations('color: red !important')).toEqual([
      { cssPropertyName: 'color', cssValue: 'red' },
    ]);
  });

  it('should skip declarations without a colon', () => {
    expect(parseCssDeclarations('color: red; invalid')).toEqual([
      { cssPropertyName: 'color', cssValue: 'red' },
    ]);
  });

  it('should skip a declaration starting with a colon', () => {
    expect(parseCssDeclarations(': red; color: blue')).toEqual([
      { cssPropertyName: 'color', cssValue: 'blue' },
    ]);
  });

  it('should skip declarations whose value is empty', () => {
    expect(
      parseCssDeclarations('color: !important; width: ; height: 10px'),
    ).toEqual([{ cssPropertyName: 'height', cssValue: '10px' }]);
  });

  it('should only split on the first colon so values may contain colons', () => {
    expect(parseCssDeclarations('background: url(http://example.com)')).toEqual(
      [{ cssPropertyName: 'background', cssValue: 'url(http://example.com)' }],
    );
  });

  it('should tolerate a trailing semicolon', () => {
    expect(parseCssDeclarations('color: red;')).toEqual([
      { cssPropertyName: 'color', cssValue: 'red' },
    ]);
  });
});
