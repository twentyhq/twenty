import { splitCssIntoTopLevelRules } from '../splitCssIntoTopLevelRules';

describe('splitCssIntoTopLevelRules', () => {
  it('should split style rules, block at-rules and statement at-rules', () => {
    expect(
      splitCssIntoTopLevelRules(
        '@import "a.css";.a{color:red}@media print{.b{color:blue}}@layer x,y;',
      ),
    ).toEqual([
      '@import "a.css";',
      '.a{color:red}',
      '@media print{.b{color:blue}}',
      '@layer x,y;',
    ]);
  });

  it('should keep rule text as written', () => {
    const cssText =
      '.a{border:1px solid var(--color);border-left:none;border-radius:var(--radius)}';

    expect(splitCssIntoTopLevelRules(cssText)).toEqual([cssText]);
  });

  it('should only end at-rules on top-level semicolons', () => {
    expect(splitCssIntoTopLevelRules('a;b{color:red}')).toEqual([
      'a;b{color:red}',
    ]);
  });

  it('should ignore delimiters inside strings and comments', () => {
    expect(
      splitCssIntoTopLevelRules('.a::before{content:"}"}/* } */.b{color:red}'),
    ).toEqual(['.a::before{content:"}"}', ' .b{color:red}']);
  });

  it('should treat unquoted urls as single tokens', () => {
    expect(
      splitCssIntoTopLevelRules(
        '@import url(https://cdn.example.com/*/a.css?w=4;6);.a{background:URL(b{.png)}',
      ),
    ).toEqual([
      '@import url(https://cdn.example.com/*/a.css?w=4;6);',
      '.a{background:URL(b{.png)}',
    ]);
  });

  it('should keep parsing quoted urls and other functions as blocks', () => {
    expect(
      splitCssIntoTopLevelRules(
        '.a{background:url("}")}.b{mask:my-url(/*}*/)}',
      ),
    ).toEqual(['.a{background:url("}")}', '.b{mask:my-url( )}']);
  });

  it('should drop rules with a closing brace outside any block', () => {
    expect(splitCssIntoTopLevelRules('}.a{color:red}.b{color:blue}')).toEqual([
      '.b{color:blue}',
    ]);
  });

  it('should close blocks left open at the end of the text', () => {
    expect(splitCssIntoTopLevelRules('.a{color:red}.b{color:blue')).toEqual([
      '.a{color:red}',
      '.b{color:blue}',
    ]);
  });

  it('should skip whitespace between rules', () => {
    expect(splitCssIntoTopLevelRules('\n.a{color:red}\n  ')).toEqual([
      '\n.a{color:red}',
    ]);
  });
});
