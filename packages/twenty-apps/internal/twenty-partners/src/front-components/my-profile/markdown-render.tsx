import Markdown from 'react-markdown';

import { COLORS, FONT } from './form-fields';

// Mirrors the public website renderer (partners-marketplace/RichText.tsx): same allow-list,
// unwrapDisallowed, and h1/h2 demoted to h3 — so the in-app preview renders exactly what a
// client sees on the profile page. Every element is styled inline because the sandboxed
// worker has no descendant CSS.
const ALLOWED = [
  'p',
  'strong',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'ul',
  'ol',
  'li',
  'a',
  'br',
];

const containerStyle = {
  fontFamily: FONT,
  fontSize: 14,
  color: COLORS.fg,
  lineHeight: 1.5,
} as const;

const headingStyle = { fontSize: 15, fontWeight: 700, margin: '10px 0 4px' } as const;
const subHeadingStyle = { fontSize: 13, fontWeight: 700, margin: '10px 0 4px' } as const;
const paragraphStyle = { margin: '6px 0' } as const;
const listStyle = { margin: '6px 0', paddingLeft: 20 } as const;
const linkStyle = { color: COLORS.accent, textDecoration: 'underline' } as const;

export const MarkdownContent = ({ source }: { source: string }) => (
  <div style={containerStyle}>
    <Markdown
      allowedElements={ALLOWED}
      unwrapDisallowed
      components={{
        h1: ({ children }) => <h3 style={headingStyle}>{children}</h3>,
        h2: ({ children }) => <h3 style={headingStyle}>{children}</h3>,
        h3: ({ children }) => <h3 style={headingStyle}>{children}</h3>,
        h4: ({ children }) => <h4 style={subHeadingStyle}>{children}</h4>,
        p: ({ children }) => <p style={paragraphStyle}>{children}</p>,
        ul: ({ children }) => <ul style={listStyle}>{children}</ul>,
        ol: ({ children }) => <ol style={listStyle}>{children}</ol>,
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noreferrer" style={linkStyle}>
            {children}
          </a>
        ),
      }}
    >
      {source}
    </Markdown>
  </div>
);
