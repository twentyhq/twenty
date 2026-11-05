import { type CSSProperties, type ReactNode } from 'react';
import { marked, type Token, type Tokens } from 'marked';

// Front components run in a remote-DOM sandbox: raw HTML injection is not
// allowed, so Markdown is rendered as real React elements with inline styles.

const INK = '#1f2430';
const HEADING = '#10152a';
const ACCENT = '#1961ed';

const styles: Record<string, CSSProperties> = {
  h1: { fontSize: '22px', fontWeight: 700, color: HEADING, margin: '28px 0 12px', lineHeight: 1.3 },
  h2: { fontSize: '18px', fontWeight: 700, color: HEADING, margin: '24px 0 10px', lineHeight: 1.3 },
  h3: { fontSize: '15px', fontWeight: 700, color: HEADING, margin: '20px 0 8px', lineHeight: 1.3 },
  p: { margin: '0 0 14px', lineHeight: 1.7, color: INK },
  ul: { margin: '0 0 14px', paddingLeft: '22px' },
  ol: { margin: '0 0 14px', paddingLeft: '22px' },
  li: { margin: '4px 0', lineHeight: 1.6, color: INK },
  a: { color: ACCENT, textDecoration: 'none' },
  code: {
    fontFamily: "'SFMono-Regular', Menlo, monospace",
    fontSize: '0.9em',
    background: '#f1f3f9',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  blockquote: {
    margin: '14px 0',
    padding: '4px 18px',
    borderLeft: `3px solid ${ACCENT}`,
    background: '#f6f8fd',
    color: '#47506a',
  },
  hr: { border: 0, borderTop: '1px solid #e6e9f2', margin: '24px 0' },
  pre: {
    background: '#f1f3f9',
    padding: '14px 16px',
    borderRadius: '6px',
    overflowX: 'auto',
    fontFamily: "'SFMono-Regular', Menlo, monospace",
    fontSize: '12px',
    lineHeight: 1.5,
    margin: '0 0 14px',
  },
};

const BLOCK_TOKEN_TYPES = new Set([
  'list',
  'paragraph',
  'code',
  'blockquote',
  'heading',
  'hr',
  'space',
]);

const renderInline = (tokens: Token[] | undefined, keyPrefix: string): ReactNode[] => {
  if (!tokens) return [];

  return tokens.map((token, index): ReactNode => {
    const key = `${keyPrefix}-${index}`;
    switch (token.type) {
      case 'strong':
        return <strong key={key}>{renderInline((token as Tokens.Strong).tokens, key)}</strong>;
      case 'em':
        return <em key={key}>{renderInline((token as Tokens.Em).tokens, key)}</em>;
      case 'codespan':
        return <code key={key} style={styles.code}>{(token as Tokens.Codespan).text}</code>;
      case 'br':
        return <br key={key} />;
      case 'link': {
        const link = token as Tokens.Link;
        const safe = /^(https?:|mailto:)/i.test(link.href ?? '');
        return safe ? (
          <a key={key} href={link.href} style={styles.a} target="_blank" rel="noopener noreferrer">
            {renderInline(link.tokens, key)}
          </a>
        ) : (
          <span key={key}>{renderInline(link.tokens, key)}</span>
        );
      }
      default: {
        const nested = (token as Tokens.Text).tokens;
        if (Array.isArray(nested) && nested.length > 0) {
          return <span key={key}>{renderInline(nested, key)}</span>;
        }
        return <span key={key}>{(token as Tokens.Text).text ?? ''}</span>;
      }
    }
  });
};

const renderBlocks = (tokens: Token[]): ReactNode[] =>
  tokens.map((token, index): ReactNode => {
    const key = `b-${index}`;
    switch (token.type) {
      case 'heading': {
        const heading = token as Tokens.Heading;
        const Tag = (['h1', 'h2', 'h3', 'h3'][heading.depth - 1] ?? 'h3') as 'h1' | 'h2' | 'h3';
        return (
          <Tag key={key} style={styles[Tag]}>
            {renderInline(heading.tokens, key)}
          </Tag>
        );
      }
      case 'paragraph':
        return <p key={key} style={styles.p}>{renderInline((token as Tokens.Paragraph).tokens, key)}</p>;
      case 'list': {
        const list = token as Tokens.List;
        const items = list.items.map((item, itemIndex) => {
          // List items can hold block-level tokens (nested lists, extra
          // paragraphs, code). Render those as blocks; keep simple items inline.
          const hasBlock = item.tokens?.some((child) => BLOCK_TOKEN_TYPES.has(child.type));
          return (
            <li key={`${key}-${itemIndex}`} style={styles.li}>
              {hasBlock
                ? renderBlocks(item.tokens)
                : renderInline(item.tokens, `${key}-${itemIndex}`)}
            </li>
          );
        });
        return list.ordered ? (
          <ol key={key} style={styles.ol}>{items}</ol>
        ) : (
          <ul key={key} style={styles.ul}>{items}</ul>
        );
      }
      case 'blockquote':
        return (
          <blockquote key={key} style={styles.blockquote}>
            {renderBlocks((token as Tokens.Blockquote).tokens)}
          </blockquote>
        );
      case 'code':
        return <pre key={key} style={styles.pre}>{(token as Tokens.Code).text}</pre>;
      case 'hr':
        return <hr key={key} style={styles.hr} />;
      case 'space':
        return null;
      case 'text': {
        // Loose list items expose their content as a `text` block token with
        // nested inline tokens — render those so bold/italic/links survive.
        const textToken = token as Tokens.Text;
        return (
          <span key={key}>
            {textToken.tokens
              ? renderInline(textToken.tokens, key)
              : textToken.text}
          </span>
        );
      }
      default: {
        const text = (token as { text?: string }).text;
        return text ? <p key={key} style={styles.p}>{text}</p> : null;
      }
    }
  });

export const Markdown = ({ content }: { content: string }): ReactNode => (
  <div>{renderBlocks(marked.lexer(content))}</div>
);
