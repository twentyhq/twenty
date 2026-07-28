import { parseCssTextIntoStyleDeclarations } from '../parseCssTextIntoStyleDeclarations';

describe('parseCssTextIntoStyleDeclarations', () => {
  it('should parse declarations into values keyed by css property name', () => {
    expect(
      parseCssTextIntoStyleDeclarations('color: red !important; width: 10px'),
    ).toEqual({ color: 'red', width: '10px' });
  });

  it('should let the last duplicate win', () => {
    expect(
      parseCssTextIntoStyleDeclarations('color: red; color: blue'),
    ).toEqual({ color: 'blue' });
  });

  it('should keep an earlier important declaration over a later normal duplicate', () => {
    expect(
      parseCssTextIntoStyleDeclarations('color: red !important; color: blue'),
    ).toEqual({ color: 'red' });
  });

  it('should lowercase standard property names while preserving custom ones', () => {
    expect(
      parseCssTextIntoStyleDeclarations('COLOR: red; --My-Var: 1px'),
    ).toEqual({ color: 'red', '--My-Var': '1px' });
  });

  it('should skip declarations without a property name or value', () => {
    expect(
      parseCssTextIntoStyleDeclarations(': red; color: ; width: 10px'),
    ).toEqual({ width: '10px' });
  });
});
