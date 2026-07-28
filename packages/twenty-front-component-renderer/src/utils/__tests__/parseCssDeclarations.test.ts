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

  it('should let the last duplicate win among normal declarations', () => {
    expect(parseCssDeclarations('color: red; color: blue')).toEqual([
      { cssPropertyName: 'color', cssValue: 'blue' },
    ]);
  });

  it('should keep an earlier important declaration over a later normal duplicate', () => {
    expect(parseCssDeclarations('color: red !important; color: blue')).toEqual([
      { cssPropertyName: 'color', cssValue: 'red' },
    ]);
  });

  it('should let a later important duplicate replace an earlier important one', () => {
    expect(
      parseCssDeclarations('color: red !important; color: blue !important'),
    ).toEqual([{ cssPropertyName: 'color', cssValue: 'blue' }]);
  });

  it('should share priority state between case variants of a property name', () => {
    expect(parseCssDeclarations('COLOR: red !important; color: blue')).toEqual([
      { cssPropertyName: 'COLOR', cssValue: 'red' },
    ]);
  });

  it('should keep case-sensitive custom properties as separate declarations', () => {
    expect(parseCssDeclarations('--My-Var: 1px; --my-var: 2px')).toEqual([
      { cssPropertyName: '--My-Var', cssValue: '1px' },
      { cssPropertyName: '--my-var', cssValue: '2px' },
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
