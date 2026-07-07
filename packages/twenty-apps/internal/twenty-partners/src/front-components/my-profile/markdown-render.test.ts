import { describe, expect, it } from 'vitest';

import { parseBlocks, parseInline } from './markdown-render';

describe('parseInline', () => {
  it('returns a single text token for plain text', () => {
    expect(parseInline('plain')).toEqual([{ type: 'text', content: 'plain' }]);
  });

  it('parses bold surrounded by text', () => {
    expect(parseInline('a **b** c')).toEqual([
      { type: 'text', content: 'a ' },
      { type: 'bold', content: 'b' },
      { type: 'text', content: ' c' },
    ]);
  });

  it('parses italic and links', () => {
    expect(parseInline('*em*')).toEqual([{ type: 'italic', content: 'em' }]);
    expect(parseInline('see [site](https://x.io)')).toEqual([
      { type: 'text', content: 'see ' },
      { type: 'link', content: 'site', href: 'https://x.io' },
    ]);
  });

  it('keeps parentheses inside a link URL', () => {
    expect(parseInline('[w](https://en.wikipedia.org/wiki/Foo_(bar))')).toEqual([
      { type: 'link', content: 'w', href: 'https://en.wikipedia.org/wiki/Foo_(bar)' },
    ]);
  });
});

describe('parseBlocks', () => {
  it('renders ### and #### as headings', () => {
    expect(parseBlocks('### Title')).toEqual([{ type: 'heading', level: 3, text: 'Title' }]);
    expect(parseBlocks('#### Sub')).toEqual([{ type: 'heading', level: 4, text: 'Sub' }]);
  });

  it('maps # and ## up to h3 (so partner headings never emit a second h1)', () => {
    expect(parseBlocks('# Big')).toEqual([{ type: 'heading', level: 3, text: 'Big' }]);
    expect(parseBlocks('## Sub')).toEqual([{ type: 'heading', level: 3, text: 'Sub' }]);
  });

  it('groups unordered and ordered list items', () => {
    expect(parseBlocks('- a\n- b')).toEqual([{ type: 'ul', items: ['a', 'b'] }]);
    expect(parseBlocks('1. a\n2. b')).toEqual([{ type: 'ol', items: ['a', 'b'] }]);
  });

  it('splits paragraphs on blank lines and joins wrapped lines', () => {
    expect(parseBlocks('one\ntwo\n\nthree')).toEqual([
      { type: 'paragraph', text: 'one two' },
      { type: 'paragraph', text: 'three' },
    ]);
  });

  it('returns an empty array for empty input', () => {
    expect(parseBlocks('')).toEqual([]);
    expect(parseBlocks('   \n  ')).toEqual([]);
  });
});
