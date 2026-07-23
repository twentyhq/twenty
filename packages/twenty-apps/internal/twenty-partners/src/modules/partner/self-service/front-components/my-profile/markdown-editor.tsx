import { type ReactNode } from 'react';

import { copyToClipboard } from 'twenty-sdk/front-component';

import { COLORS, FONT } from './form-fields';
import { MarkdownContent } from './markdown-render';

// The sandboxed worker exposes no cursor/selection API (DOM refs are method-less proxies,
// and selection offsets aren't forwarded), so toolbar buttons append a ready-to-edit
// snippet rather than wrapping the current selection. The always-on side-by-side preview
// is what makes that workable — the partner sees the result form as they type.
type Tool = { title: string; insert: string; block: boolean; label: ReactNode };

const TOOLS: Tool[] = [
  { title: 'Bold', insert: '**bold**', block: false, label: <span style={{ fontWeight: 700 }}>Bold</span> },
  { title: 'Italic', insert: '*italic*', block: false, label: <span style={{ fontStyle: 'italic' }}>Italic</span> },
  {
    title: 'Heading',
    insert: '### Heading',
    block: true,
    label: <span style={{ fontWeight: 700, fontSize: 14 }}>Heading</span>,
  },
  { title: 'Bullet list', insert: '- item', block: true, label: <span>•&nbsp;List</span> },
  { title: 'Numbered list', insert: '1. item', block: true, label: <span>1.&nbsp;List</span> },
  {
    title: 'Link',
    insert: '[text](https://)',
    block: false,
    label: <span style={{ color: COLORS.accent, textDecoration: 'underline' }}>Link</span>,
  },
];

const appendSnippet = (value: string, tool: Tool): string => {
  if (value === '') return tool.insert;
  if (tool.block) {
    const separator = value.endsWith('\n\n') ? '' : value.endsWith('\n') ? '\n' : '\n\n';
    return `${value}${separator}${tool.insert}`;
  }
  const separator = value.endsWith(' ') || value.endsWith('\n') ? '' : ' ';
  return `${value}${separator}${tool.insert}`;
};

const buildPrompt = (value: string): string =>
  [
    'Reformat the text below as clean markdown for my partner profile.',
    'Use only: **bold**, *italic*, ### headings, - bullet lists, 1. numbered lists, and [links](url).',
    "Keep all the information and don't invent anything.",
    'Ask me any questions you need to be sure you have captured all the formatting I want, then return only the formatted text.',
    '',
    '---',
    value.trim() === '' ? '(paste your introduction here)' : value.trim(),
  ].join('\n');

// The front-component runs in a Web Worker with no clipboard API; copyToClipboard is a host
// action that copies on the main thread and shows its own confirmation snackbar.
const copyPrompt = (value: string): Promise<void> => copyToClipboard(buildPrompt(value));

const EDITOR_HEIGHT = 280;

const toolbarStyle = { display: 'flex', flexWrap: 'wrap', gap: 6 } as const;

const toolButtonStyle = {
  height: 30,
  padding: '0 12px',
  borderRadius: 6,
  border: `1px solid ${COLORS.border}`,
  background: COLORS.surface,
  color: COLORS.fg,
  fontSize: 13,
  fontFamily: FONT,
  cursor: 'pointer',
} as const;

const paneStyle = { flex: '1 1 340px', minWidth: 0, height: EDITOR_HEIGHT } as const;

const controlBase = {
  width: '100%',
  height: '100%',
  boxSizing: 'border-box',
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  background: COLORS.surface,
  fontFamily: FONT,
  fontSize: 14,
  color: COLORS.fg,
  lineHeight: 1.5,
  padding: '10px 12px',
} as const;

const textareaStyle = { ...controlBase, resize: 'none' } as const;

const previewBoxStyle = { ...controlBase, overflowY: 'auto' } as const;

const eyebrowStyle = {
  fontSize: 10.5,
  fontWeight: 700,
  letterSpacing: 0.5,
  textTransform: 'uppercase',
  color: COLORS.muted,
  marginBottom: 6,
} as const;

const helpBoxStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  background: COLORS.surfaceAlt,
  padding: 12,
} as const;

const copyButtonStyle = {
  alignSelf: 'flex-start',
  height: 30,
  padding: '0 14px',
  borderRadius: 6,
  border: 'none',
  background: COLORS.accent,
  color: '#fff',
  fontSize: 13,
  fontWeight: 600,
  fontFamily: FONT,
  cursor: 'pointer',
} as const;

export const MarkdownEditor = ({
  value,
  onChange,
  placeholder,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <div style={toolbarStyle}>
      {TOOLS.map((tool) => (
        <button
          key={tool.title}
          type="button"
          title={tool.title}
          style={toolButtonStyle}
          onClick={() => onChange(appendSnippet(value, tool))}
        >
          {tool.label}
        </button>
      ))}
    </div>

    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <div style={paneStyle}>
        <textarea
          style={textareaStyle}
          value={value}
          placeholder={placeholder}
          aria-label={ariaLabel ?? placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
      <div style={paneStyle}>
        <div style={previewBoxStyle}>
          <div style={eyebrowStyle}>Preview</div>
          {value.trim() === '' ? (
            <span style={{ color: COLORS.muted, fontSize: 13 }}>
              Your formatted text appears here.
            </span>
          ) : (
            <MarkdownContent source={value} />
          )}
        </div>
      </div>
    </div>

    <div style={helpBoxStyle}>
      <span style={{ fontSize: 12.5, color: COLORS.muted }}>
        Not comfortable with Markdown? Copy the prompt into your AI agent to format it for you.
      </span>
      <button type="button" style={copyButtonStyle} onClick={() => void copyPrompt(value)}>
        Copy prompt
      </button>
    </div>
  </div>
);
