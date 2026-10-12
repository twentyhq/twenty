import { splitCssAtTopLevel } from '../splitCssAtTopLevel';

describe('splitCssAtTopLevel', () => {
  it('should split only on separators outside of blocks', () => {
    expect(
      splitCssAtTopLevel({
        cssText: 'a, (b, c), [d, e], {f, g}, h',
        separator: ',',
      }),
    ).toEqual(['a', ' (b, c)', ' [d, e]', ' {f, g}', ' h']);
  });

  it('should ignore separators inside strings, including strings ended by a newline', () => {
    expect(
      splitCssAtTopLevel({ cssText: '"a, b", c', separator: ',' }),
    ).toEqual(['"a, b"', ' c']);
    expect(splitCssAtTopLevel({ cssText: '"a\n, b', separator: ',' })).toEqual([
      '"a\n',
      ' b',
    ]);
  });

  it('should replace each comment with a space and ignore separators inside it', () => {
    expect(
      splitCssAtTopLevel({ cssText: 'a/* , */b, c', separator: ',' }),
    ).toEqual(['a b', ' c']);
    expect(
      splitCssAtTopLevel({ cssText: 'a /* b, c', separator: ',' }),
    ).toEqual(['a  ']);
    expect(splitCssAtTopLevel({ cssText: '"/*", a', separator: ',' })).toEqual([
      '"/*"',
      ' a',
    ]);
  });

  it('should close blocks left open at the end of the text', () => {
    expect(
      splitCssAtTopLevel({ cssText: 'a, (b, [c', separator: ',' }),
    ).toEqual(['a', ' (b, [c])']);
  });

  it('should keep escaped separators', () => {
    expect(
      splitCssAtTopLevel({ cssText: 'a\\, b, c', separator: ',' }),
    ).toEqual(['a\\, b', ' c']);
  });

  it('should split on a multi-character separator at the top level only', () => {
    expect(
      splitCssAtTopLevel({
        cssText: '(a) and ((b) and (c)) and d',
        separator: ' and ',
      }),
    ).toEqual(['(a)', '((b) and (c))', 'd']);
  });
});
