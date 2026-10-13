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
});
