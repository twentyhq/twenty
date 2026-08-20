import { isSingleTopLevelCssGroup } from '@/utils/css/isSingleTopLevelCssGroup';

describe('isSingleTopLevelCssGroup', () => {
  it('should accept one group wrapping the whole condition', () => {
    expect(isSingleTopLevelCssGroup('(display: grid)')).toBe(true);
    expect(isSingleTopLevelCssGroup('(color: rgb(0, 0, 0))')).toBe(true);
    expect(isSingleTopLevelCssGroup('()')).toBe(true);
  });

  it('should reject conditions holding more than one top level group', () => {
    expect(
      isSingleTopLevelCssGroup('(display: grid) and (position: sticky)'),
    ).toBe(false);
    expect(isSingleTopLevelCssGroup('(display: grid)(display: flex)')).toBe(
      false,
    );
  });

  it('should reject conditions that are not wrapped at all', () => {
    expect(isSingleTopLevelCssGroup('display: grid')).toBe(false);
    expect(isSingleTopLevelCssGroup('not (display: grid)')).toBe(false);
  });

  it('should reject unbalanced parentheses', () => {
    expect(isSingleTopLevelCssGroup('(((')).toBe(false);
    expect(isSingleTopLevelCssGroup('(display: grid))')).toBe(false);
    expect(isSingleTopLevelCssGroup(')display: grid(')).toBe(false);
  });
});
