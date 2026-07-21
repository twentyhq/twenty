import { createElement } from 'react';

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { MarkdownContent } from './markdown-render';

const render = (source: string): string =>
  renderToStaticMarkup(createElement(MarkdownContent, { source }));

describe('MarkdownContent', () => {
  it('renders bold, italic, and links', () => {
    const html = render('a **b** _c_ [d](https://x.io)');
    expect(html).toContain('<strong>b</strong>');
    expect(html).toContain('<em>c</em>');
    expect(html).toContain('href="https://x.io"');
  });

  it('demotes # and ## to h3 and never emits h1/h2', () => {
    const html = render('# Big\n\n## Sub\n\n### Three');
    expect(html).toContain('<h3');
    expect(html).not.toContain('<h1');
    expect(html).not.toContain('<h2');
  });

  it('renders bullet and numbered lists', () => {
    expect(render('- a\n- b')).toContain('<ul');
    expect(render('1. a\n2. b')).toContain('<ol');
  });

  it('leaves a pipe-table as text (matches the website, which has no remark-gfm)', () => {
    const html = render('| a | b |\n| --- | --- |\n| 1 | 2 |');
    expect(html).not.toContain('<table');
  });
});
