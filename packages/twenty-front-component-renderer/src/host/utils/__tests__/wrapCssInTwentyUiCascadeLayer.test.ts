import { wrapCssInTwentyUiCascadeLayer } from '../wrapCssInTwentyUiCascadeLayer';

describe('wrapCssInTwentyUiCascadeLayer', () => {
  it('should put front component CSS in the twenty-ui cascade layer', () => {
    expect(
      wrapCssInTwentyUiCascadeLayer('button{padding:0;background:none}'),
    ).toBe('@layer twenty-ui {\nbutton{padding:0;background:none}\n}');
  });

  it('should keep a twenty-ui layer block as is and wrap the rules around it', () => {
    expect(
      wrapCssInTwentyUiCascadeLayer(
        '.monaco-editor{outline-width:0}@layer twenty-ui{._root_x1_1{display:flex}}button{padding:0}',
      ),
    ).toBe(
      '@layer twenty-ui {\n.monaco-editor{outline-width:0}\n}@layer twenty-ui{._root_x1_1{display:flex}}@layer twenty-ui {\nbutton{padding:0}\n}',
    );
  });

  it('should find the end of a twenty-ui layer block past braces in strings and comments', () => {
    expect(
      wrapCssInTwentyUiCascadeLayer(
        '@layer twenty-ui{.icon::before{content:"}"}/* } */}.title{color:red}',
      ),
    ).toBe(
      '@layer twenty-ui{.icon::before{content:"}"}/* } */}@layer twenty-ui {\n.title{color:red}\n}',
    );
  });

  it('should wrap a twenty-ui layer block nested in another block', () => {
    expect(
      wrapCssInTwentyUiCascadeLayer(
        '@media print{@layer twenty-ui{.title{color:red}}}',
      ),
    ).toBe(
      '@layer twenty-ui {\n@media print{@layer twenty-ui{.title{color:red}}}\n}',
    );
  });

  it('should keep leading @charset and @import statements outside the layer block', () => {
    expect(
      wrapCssInTwentyUiCascadeLayer(
        '@charset "UTF-8";@import url(https://fonts.example.com/inter.css?weights=400;600);.title{font-family:Inter}',
      ),
    ).toBe(
      '@charset "UTF-8";@import url(https://fonts.example.com/inter.css?weights=400;600) layer(twenty-ui);@layer twenty-ui {\n.title{font-family:Inter}\n}',
    );
  });

  it('should handle an unterminated import with many url tokens without backtracking', () => {
    const unterminatedImport = `@import ${'url()'.repeat(10000)}`;

    expect(wrapCssInTwentyUiCascadeLayer(unterminatedImport)).toBe(
      `@layer twenty-ui {\n${unterminatedImport}\n}`,
    );
  });

  it('should keep an import with nested parentheses outside the layer block', () => {
    expect(
      wrapCssInTwentyUiCascadeLayer(
        '@import "focus.css" supports(selector(:focus-visible));.title{color:red}',
      ),
    ).toBe(
      '@import "focus.css" layer(twenty-ui) supports(selector(:focus-visible));@layer twenty-ui {\n.title{color:red}\n}',
    );
  });

  it('should ignore braces and semicolons inside the comments of an import', () => {
    expect(
      wrapCssInTwentyUiCascadeLayer(
        '@import "theme.css" /* { */;@import url(fonts.css) /* ; */;.title{color:red}',
      ),
    ).toBe(
      '@import "theme.css" layer(twenty-ui)  ;@import url(fonts.css) layer(twenty-ui)  ;@layer twenty-ui {\n.title{color:red}\n}',
    );
  });

  it('should nest the layer of an import with comments inside the twenty-ui layer', () => {
    expect(
      wrapCssInTwentyUiCascadeLayer(
        '@import /* theme */ "theme.css" /* tokens */ layer(base);.title{color:red}',
      ),
    ).toBe(
      '@import "theme.css" layer(twenty-ui.base);@layer twenty-ui {\n.title{color:red}\n}',
    );
  });

  it('should keep comment markers inside an unquoted import URL', () => {
    expect(
      wrapCssInTwentyUiCascadeLayer(
        '@import url(https://cdn.example.com/css/*/theme.css);@import url(https://cdn.example.com/*fonts*/inter.css);.title{color:red}',
      ),
    ).toBe(
      '@import url(https://cdn.example.com/css/*/theme.css) layer(twenty-ui);@import url(https://cdn.example.com/*fonts*/inter.css) layer(twenty-ui);@layer twenty-ui {\n.title{color:red}\n}',
    );
  });

  it('should handle an unterminated comment without backtracking', () => {
    const unterminatedComment = `@import "theme.css" ${'/*a'.repeat(100000)}`;

    expect(wrapCssInTwentyUiCascadeLayer(unterminatedComment)).toBe(
      `@layer twenty-ui {\n${unterminatedComment}\n}`,
    );
  });

  it('should nest the layer of an import inside the twenty-ui layer', () => {
    expect(
      wrapCssInTwentyUiCascadeLayer(
        '@import "reset.css" layer(base);.title{color:red}',
      ),
    ).toBe(
      '@import "reset.css" layer(twenty-ui.base);@layer twenty-ui {\n.title{color:red}\n}',
    );
  });

  it('should layer minified imports', () => {
    expect(
      wrapCssInTwentyUiCascadeLayer(
        '@import"reset.css"layer(base);@import"theme.css";.title{color:red}',
      ),
    ).toBe(
      '@import "reset.css" layer(twenty-ui.base);@import "theme.css" layer(twenty-ui);@layer twenty-ui {\n.title{color:red}\n}',
    );
  });

  it('should give each anonymous import layer its own layer inside the twenty-ui layer', () => {
    expect(
      wrapCssInTwentyUiCascadeLayer(
        '@import url(fonts.css) layer;@import "theme.css" layer;.title{color:red}',
      ),
    ).toBe(
      '@import url(fonts.css) layer(twenty-ui.anonymous-fonts-css);@import "theme.css" layer(twenty-ui.anonymous-theme-css);@layer twenty-ui {\n.title{color:red}\n}',
    );
  });
});
