import { type ReactNode } from 'react';

import { COLORS } from './form-fields';

// Mirrors the public website renderer (partners-marketplace/RichText.tsx, react-markdown
// with allowedElements strong/em/h3/h4/ul/ol/li/a/br). Hand-rolled because the sandboxed
// worker can't run react-markdown, and rendered with div/span only — the elements the
// worker is known to support. Approximates the site closely enough for an authoring preview.

export type InlineToken =
  | { type: 'text'; content: string }
  | { type: 'bold'; content: string }
  | { type: 'italic'; content: string }
  | { type: 'link'; content: string; href: string };

export type Block =
  | { type: 'heading'; level: 3 | 4; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'paragraph'; text: string };

// Bold before italic so `**x**` is not mis-read as italic. The link URL group allows one
// level of nested parens so `[w](https://en.wikipedia.org/wiki/Foo_(bar))` keeps its `)`.
const INLINE_PATTERNS: { type: 'bold' | 'italic' | 'link'; re: RegExp }[] = [
  { type: 'bold', re: /\*\*([^*]+)\*\*/ },
  { type: 'link', re: /\[([^\]]+)\]\(((?:[^()\s]|\([^()]*\))+)\)/ },
  { type: 'italic', re: /\*([^*]+)\*/ },
];

export const parseInline = (text: string): InlineToken[] => {
  const tokens: InlineToken[] = [];
  let rest = text;

  while (rest.length > 0) {
    let earliest: { index: number; type: 'bold' | 'italic' | 'link'; match: RegExpExecArray } | null =
      null;

    for (const { type, re } of INLINE_PATTERNS) {
      const match = re.exec(rest);
      if (match !== null && (earliest === null || match.index < earliest.index)) {
        earliest = { index: match.index, type, match };
      }
    }

    if (earliest === null) {
      tokens.push({ type: 'text', content: rest });
      break;
    }

    if (earliest.index > 0) {
      tokens.push({ type: 'text', content: rest.slice(0, earliest.index) });
    }

    const { match, type } = earliest;
    if (type === 'link') {
      tokens.push({ type: 'link', content: match[1], href: match[2] });
    } else if (type === 'bold') {
      tokens.push({ type: 'bold', content: match[1] });
    } else {
      tokens.push({ type: 'italic', content: match[1] });
    }

    rest = rest.slice(earliest.index + match[0].length);
  }

  return tokens;
};

export const parseBlocks = (source: string): Block[] => {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let ulItems: string[] = [];
  let olItems: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push({ type: 'paragraph', text: paragraph.join(' ') });
      paragraph = [];
    }
  };
  const flushUl = () => {
    if (ulItems.length > 0) {
      blocks.push({ type: 'ul', items: ulItems });
      ulItems = [];
    }
  };
  const flushOl = () => {
    if (olItems.length > 0) {
      blocks.push({ type: 'ol', items: olItems });
      olItems = [];
    }
  };
  const flushAll = () => {
    flushParagraph();
    flushUl();
    flushOl();
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (line.trim() === '') {
      flushAll();
      continue;
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading !== null) {
      const hashes = heading[1].length;
      // #/##/### all render as h3 and #### as h4 — mirrors the site mapping h1/h2 down to
      // h3 so partner headings never emit a second <h1> on the page.
      flushAll();
      blocks.push({ type: 'heading', level: hashes >= 4 ? 4 : 3, text: heading[2] });
      continue;
    }

    const ul = /^[-*]\s+(.*)$/.exec(line);
    if (ul !== null) {
      flushParagraph();
      flushOl();
      ulItems.push(ul[1]);
      continue;
    }

    const ol = /^\d+\.\s+(.*)$/.exec(line);
    if (ol !== null) {
      flushParagraph();
      flushUl();
      olItems.push(ol[1]);
      continue;
    }

    flushUl();
    flushOl();
    paragraph.push(line.trim());
  }

  flushAll();
  return blocks;
};

const linkStyle = { color: COLORS.accent, textDecoration: 'underline' } as const;

const itemRowStyle = { display: 'flex', gap: 6, margin: '2px 0' } as const;

const renderInline = (text: string, keyPrefix: string): ReactNode[] =>
  parseInline(text).map((token, index) => {
    const key = `${keyPrefix}-${index}`;
    switch (token.type) {
      case 'bold':
        return (
          <span key={key} style={{ fontWeight: 700 }}>
            {token.content}
          </span>
        );
      case 'italic':
        return (
          <span key={key} style={{ fontStyle: 'italic' }}>
            {token.content}
          </span>
        );
      case 'link':
        return (
          <span key={key} style={linkStyle}>
            {token.content}
          </span>
        );
      default:
        return <span key={key}>{token.content}</span>;
    }
  });

const renderBlock = (block: Block, key: string): ReactNode => {
  switch (block.type) {
    case 'heading':
      return (
        <div key={key} style={{ fontSize: block.level === 3 ? 15 : 13, fontWeight: 700, margin: '10px 0 4px' }}>
          {renderInline(block.text, key)}
        </div>
      );
    case 'ul':
      return (
        <div key={key} style={{ margin: '6px 0' }}>
          {block.items.map((item, index) => (
            <div key={`${key}-${index}`} style={itemRowStyle}>
              <span style={{ color: COLORS.muted }}>•</span>
              <span>{renderInline(item, `${key}-${index}`)}</span>
            </div>
          ))}
        </div>
      );
    case 'ol':
      return (
        <div key={key} style={{ margin: '6px 0' }}>
          {block.items.map((item, index) => (
            <div key={`${key}-${index}`} style={itemRowStyle}>
              <span style={{ color: COLORS.muted }}>{index + 1}.</span>
              <span>{renderInline(item, `${key}-${index}`)}</span>
            </div>
          ))}
        </div>
      );
    default:
      return (
        <div key={key} style={{ margin: '6px 0' }}>
          {renderInline(block.text, key)}
        </div>
      );
  }
};

// Renders the parsed markdown as a fragment (no surrounding box) so callers control layout.
export const MarkdownContent = ({ source }: { source: string }) => {
  const blocks = parseBlocks(source);
  if (blocks.length === 0) {
    return null;
  }
  return <>{blocks.map((block, index) => renderBlock(block, `block-${index}`))}</>;
};
