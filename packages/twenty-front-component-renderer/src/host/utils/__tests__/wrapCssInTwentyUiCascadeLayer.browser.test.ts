import { isDefined } from 'twenty-shared/utils';
import { describe, expect, it } from 'vitest';

import { wrapCssInTwentyUiCascadeLayer } from '../wrapCssInTwentyUiCascadeLayer';

const getCssRules = (cssText: string): CSSRule[] => {
  const detachedDocument = document.implementation.createHTMLDocument('');
  const styleElement = detachedDocument.createElement('style');

  styleElement.textContent = cssText;
  detachedDocument.head.appendChild(styleElement);

  const styleSheet = styleElement.sheet;

  if (!isDefined(styleSheet)) {
    throw new Error('Unable to parse stylesheet');
  }

  return Array.from(styleSheet.cssRules);
};

const getImportRules = (cssText: string): CSSImportRule[] =>
  getCssRules(cssText).filter(
    (cssRule): cssRule is CSSImportRule => cssRule instanceof CSSImportRule,
  );

const getLayerBlockRules = (cssText: string): CSSLayerBlockRule[] =>
  getCssRules(cssText).filter(
    (cssRule): cssRule is CSSLayerBlockRule =>
      cssRule instanceof CSSLayerBlockRule,
  );

describe('wrapCssInTwentyUiCascadeLayer', () => {
  it('puts ordinary CSS rules in the twenty-ui layer', () => {
    const [layerBlock] = getLayerBlockRules(
      wrapCssInTwentyUiCascadeLayer('button{padding:0;background:none}'),
    );

    expect(layerBlock.name).toBe('twenty-ui');
    expect(layerBlock.cssRules[0]).toBeInstanceOf(CSSStyleRule);
    expect((layerBlock.cssRules[0] as CSSStyleRule).selectorText).toBe(
      'button',
    );
  });

  it('preserves bundled twenty-ui blocks and wraps the rules around them', () => {
    const layerBlocks = getLayerBlockRules(
      wrapCssInTwentyUiCascadeLayer(
        '.monaco-editor{outline-width:0}@layer twenty-ui{._root_x1_1{display:flex}}button{padding:0}',
      ),
    );

    expect(layerBlocks.map((layerBlock) => layerBlock.name)).toEqual([
      'twenty-ui',
      'twenty-ui',
      'twenty-ui',
    ]);
    expect(
      layerBlocks.flatMap((layerBlock) =>
        Array.from(layerBlock.cssRules).map(
          (cssRule) => (cssRule as CSSStyleRule).selectorText,
        ),
      ),
    ).toEqual(['.monaco-editor', '._root_x1_1', 'button']);
  });

  it('nests other layer blocks and conditional rules inside twenty-ui', () => {
    const [layerBlock] = getLayerBlockRules(
      wrapCssInTwentyUiCascadeLayer(
        '@layer theme{.title{color:red}}@media print{@layer twenty-ui{.title{color:blue}}}',
      ),
    );

    expect(layerBlock.name).toBe('twenty-ui');
    expect(layerBlock.cssRules[0]).toBeInstanceOf(CSSLayerBlockRule);
    expect((layerBlock.cssRules[0] as CSSLayerBlockRule).name).toBe('theme');
    expect(layerBlock.cssRules[1]).toBeInstanceOf(CSSMediaRule);
    expect(
      (
        (layerBlock.cssRules[1] as CSSMediaRule)
          .cssRules[0] as CSSLayerBlockRule
      ).name,
    ).toBe('twenty-ui');
  });

  it('keeps namespace declarations at the top level', () => {
    const cssRules = getCssRules(
      wrapCssInTwentyUiCascadeLayer(
        '@namespace svg "http://www.w3.org/2000/svg";svg|circle{fill:red}',
      ),
    );

    expect(cssRules[0]).toBeInstanceOf(CSSNamespaceRule);
    expect((cssRules[0] as CSSNamespaceRule).prefix).toBe('svg');
    expect(cssRules[1]).toBeInstanceOf(CSSLayerBlockRule);
    expect(
      ((cssRules[1] as CSSLayerBlockRule).cssRules[0] as CSSStyleRule)
        .selectorText,
    ).toBe('svg|circle');
  });

  it('preserves import conditions and rewrites minified imports with comments', () => {
    const importRules = getImportRules(
      wrapCssInTwentyUiCascadeLayer(
        '@import/* theme */"theme.css"/* tokens */layer(base) supports(selector(:focus-visible)) screen and (min-width:1px);@import"reset.css";.title{color:red}',
      ),
    );

    expect(importRules.map((importRule) => importRule.href)).toEqual([
      'theme.css',
      'reset.css',
    ]);
    expect(importRules.map((importRule) => importRule.layerName)).toEqual([
      'twenty-ui.base',
      'twenty-ui',
    ]);
    expect(importRules[0].supportsText).toBe('selector(:focus-visible)');
    expect(importRules[0].media.mediaText).toBe('screen and (min-width: 1px)');
  });

  it('keeps leading layer order statements before imports', () => {
    const cssRules = getCssRules(
      wrapCssInTwentyUiCascadeLayer(
        '@layer base,theme;@import"theme.css"layer(theme);@import"base.css"layer(base);@layer theme{.title{color:red}}',
      ),
    );

    expect(cssRules[0]).toBeInstanceOf(CSSLayerStatementRule);
    expect((cssRules[0] as CSSLayerStatementRule).nameList).toEqual([
      'twenty-ui.base',
      'twenty-ui.theme',
    ]);
    expect(cssRules[1]).toBeInstanceOf(CSSImportRule);
    expect(cssRules[2]).toBeInstanceOf(CSSImportRule);
    expect((cssRules[1] as CSSImportRule).layerName).toBe('twenty-ui.theme');
    expect((cssRules[2] as CSSImportRule).layerName).toBe('twenty-ui.base');
    expect(cssRules[3]).toBeInstanceOf(CSSLayerBlockRule);
  });

  it('preserves existing twenty-ui import layers and order declarations', () => {
    const cssRules = getCssRules(
      wrapCssInTwentyUiCascadeLayer(
        '@layer twenty-ui,twenty-ui.theme;@import"base.css"layer(twenty-ui);@import"theme.css"layer(twenty-ui.theme);',
      ),
    );

    expect((cssRules[0] as CSSLayerStatementRule).nameList).toEqual([
      'twenty-ui',
      'twenty-ui.theme',
    ]);
    expect((cssRules[1] as CSSImportRule).layerName).toBe('twenty-ui');
    expect((cssRules[2] as CSSImportRule).layerName).toBe('twenty-ui.theme');
  });

  it('preserves existing twenty-ui sublayer blocks', () => {
    const cssRules = getCssRules(
      wrapCssInTwentyUiCascadeLayer(
        '@layer twenty-ui.base;@import"base.css"layer(twenty-ui.base);@layer twenty-ui.base{.title{color:red}}',
      ),
    );

    expect((cssRules[0] as CSSLayerStatementRule).nameList).toEqual([
      'twenty-ui.base',
    ]);
    expect((cssRules[1] as CSSImportRule).layerName).toBe('twenty-ui.base');
    expect((cssRules[2] as CSSLayerBlockRule).name).toBe('twenty-ui.base');
    expect(
      ((cssRules[2] as CSSLayerBlockRule).cssRules[0] as CSSStyleRule)
        .selectorText,
    ).toBe('.title');
  });

  it('keeps escaped layer identifiers consistent between statements and imports', () => {
    const cssRules = getCssRules(
      wrapCssInTwentyUiCascadeLayer(
        String.raw`@layer fo\.o;@import "theme.css" layer(fo\.o);@layer fo\.o{.title{color:red}}`,
      ),
    );

    expect((cssRules[0] as CSSLayerStatementRule).nameList).toEqual([
      String.raw`twenty-ui.fo\.o`,
    ]);
    expect((cssRules[1] as CSSImportRule).layerName).toBe(
      String.raw`twenty-ui.fo\.o`,
    );
    expect(
      ((cssRules[2] as CSSLayerBlockRule).cssRules[0] as CSSLayerBlockRule)
        .name,
    ).toBe(String.raw`fo\.o`);
  });

  it('gives repeated anonymous imports distinct layers across stylesheets', () => {
    const importRules = [
      ...getImportRules(
        wrapCssInTwentyUiCascadeLayer(
          '@import"theme.css"layer;@import"theme.css"layer;',
        ),
      ),
      ...getImportRules(
        wrapCssInTwentyUiCascadeLayer('@import"theme.css"layer;'),
      ),
    ];
    const layerNames = importRules.map((importRule) => importRule.layerName);

    expect(new Set(layerNames).size).toBe(3);

    for (const layerName of layerNames) {
      expect(layerName).toMatch(/^twenty-ui\./);
    }
  });

  it('keeps anonymous imports separate from named layers with the same prefix', () => {
    const [anonymousImport, namedImport] = getImportRules(
      wrapCssInTwentyUiCascadeLayer(
        '@import"base.css"layer;@import"theme.css"layer(anonymous-1);',
      ),
    );

    expect(namedImport.layerName).toBe('twenty-ui.anonymous-1');
    expect(anonymousImport.layerName).not.toBe(namedImport.layerName);
  });

  it.each([
    String.raw`@import "a\"b)c.css";`,
    String.raw`@import "a\a b.css";`,
    String.raw`@import "a\9 b.css";`,
    '@import url(https://cdn.example.com/css/*/theme.css?weights=400;600);',
  ])('preserves escaped and delimited URLs in %s', (cssText) => {
    const [originalImport] = getImportRules(cssText);
    const [layeredImport] = getImportRules(
      wrapCssInTwentyUiCascadeLayer(cssText),
    );

    expect(layeredImport.href).toBe(originalImport.href);
    expect(layeredImport.layerName).toBe('twenty-ui');
  });

  it('parses braces in strings and comments without splitting layer blocks', () => {
    const layerBlocks = getLayerBlockRules(
      wrapCssInTwentyUiCascadeLayer(
        '@layer twenty-ui{.icon::before{content:"}"}/* } */}.title{color:red}',
      ),
    );

    expect(layerBlocks).toHaveLength(2);
    expect(
      (layerBlocks[0].cssRules[0] as CSSStyleRule).style.getPropertyValue(
        'content',
      ),
    ).toBe('"}"');
    expect((layerBlocks[1].cssRules[0] as CSSStyleRule).selectorText).toBe(
      '.title',
    );
  });

  it('handles unterminated import tokens and comments', () => {
    expect(() =>
      wrapCssInTwentyUiCascadeLayer(`@import ${'url()'.repeat(10000)}`),
    ).not.toThrow();
    expect(() =>
      wrapCssInTwentyUiCascadeLayer(
        `@import "theme.css" ${'/*a'.repeat(100000)}`,
      ),
    ).not.toThrow();
  });

  it('loads imports and preserves their declared layer precedence', async () => {
    const element = document.createElement('div');
    const styleElement = document.createElement('style');

    element.id = `cascade-layer-${crypto.randomUUID()}`;

    const baseUrl = `data:text/css,${encodeURIComponent(`#${element.id}{color:red}`)}`;
    const themeUrl = `data:text/css,${encodeURIComponent(`#${element.id}{color:blue}`)}`;

    styleElement.textContent = wrapCssInTwentyUiCascadeLayer(
      `@layer base,theme;@import "${themeUrl}" layer(theme);@import "${baseUrl}" layer(base);`,
    );

    document.body.appendChild(element);
    document.head.appendChild(styleElement);

    try {
      await expect
        .poll(() => getComputedStyle(element).color)
        .toBe('rgb(0, 0, 255)');
    } finally {
      styleElement.remove();
      element.remove();
    }
  });
});
