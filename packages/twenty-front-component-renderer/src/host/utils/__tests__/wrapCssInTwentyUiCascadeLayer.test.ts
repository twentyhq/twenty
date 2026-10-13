import { wrapCssInTwentyUiCascadeLayer } from '../wrapCssInTwentyUiCascadeLayer';

describe('wrapCssInTwentyUiCascadeLayer', () => {
  it('should put front component CSS in the twenty-ui cascade layer', () => {
    expect(
      wrapCssInTwentyUiCascadeLayer('button{padding:0;background:none}'),
    ).toBe('@layer twenty-ui {\nbutton{padding:0;background:none}\n}');
  });

  it('should keep a stylesheet that already uses the twenty-ui layer as is', () => {
    const twentyUiStylesheet =
      '.monaco-editor{outline-width:0}@layer twenty-ui{._root_x1_1{display:flex}}';

    expect(wrapCssInTwentyUiCascadeLayer(twentyUiStylesheet)).toBe(
      twentyUiStylesheet,
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

  it('should keep the layer of an import that already declares one', () => {
    expect(
      wrapCssInTwentyUiCascadeLayer(
        '@import "theme.css" layer(theme);.title{color:red}',
      ),
    ).toBe(
      '@import "theme.css" layer(theme);@layer twenty-ui {\n.title{color:red}\n}',
    );
  });
});
