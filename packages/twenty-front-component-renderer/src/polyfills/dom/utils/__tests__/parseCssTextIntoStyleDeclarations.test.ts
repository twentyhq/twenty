import { parseCssTextIntoStyleDeclarations } from '../parseCssTextIntoStyleDeclarations';

describe('parseCssTextIntoStyleDeclarations', () => {
  it('should parse declarations into store values and important priorities', () => {
    const { cssValueByStoreKey, importantPriorityStoreKeys } =
      parseCssTextIntoStyleDeclarations('color: red !important; width: 10px');

    expect(cssValueByStoreKey).toEqual({ color: 'red', width: '10px' });
    expect([...importantPriorityStoreKeys]).toEqual(['color']);
  });

  it('should let the last duplicate win', () => {
    const { cssValueByStoreKey } = parseCssTextIntoStyleDeclarations(
      'color: red; color: blue',
    );

    expect(cssValueByStoreKey.color).toBe('blue');
  });

  it('should keep an earlier important declaration over a later normal duplicate', () => {
    const { cssValueByStoreKey, importantPriorityStoreKeys } =
      parseCssTextIntoStyleDeclarations('color: red !important; color: blue');

    expect(cssValueByStoreKey.color).toBe('red');
    expect(importantPriorityStoreKeys.has('color')).toBe(true);
  });

  it('should lowercase standard property names while preserving custom ones', () => {
    const { cssValueByStoreKey } = parseCssTextIntoStyleDeclarations(
      'COLOR: red; --My-Var: 1px',
    );

    expect(cssValueByStoreKey).toEqual({ color: 'red', '--My-Var': '1px' });
  });

  it('should skip declarations without a property name or value', () => {
    const { cssValueByStoreKey } = parseCssTextIntoStyleDeclarations(
      ': red; color: ; width: 10px',
    );

    expect(cssValueByStoreKey).toEqual({ width: '10px' });
  });
});
