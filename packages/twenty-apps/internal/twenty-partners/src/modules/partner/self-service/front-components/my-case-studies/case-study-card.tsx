import { type CSSProperties } from 'react';

import { COLORS, Field, FONT, TextInput, UrlInput } from '../my-profile/form-fields';
import { MarkdownEditor } from '../my-profile/markdown-editor';
import { type CaseStudyRow } from './case-study-rows';

type CaseStudyCardProps = {
  row: CaseStudyRow;
  expanded: boolean;
  busy: boolean;
  onToggleExpand: () => void;
  onChange: (patch: Partial<CaseStudyRow>) => void;
  onSave: () => void;
  onDelete: () => void;
};

const cardStyle: CSSProperties = {
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  background: COLORS.surface,
  marginBottom: 12,
  fontFamily: FONT,
};
const summaryStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  padding: '12px 14px',
  cursor: 'pointer',
};
const titleStyle: CSSProperties = { fontSize: 14, fontWeight: 600, color: COLORS.fg };
const clientStyle: CSSProperties = {
  fontSize: 11,
  letterSpacing: 0.4,
  textTransform: 'uppercase',
  color: COLORS.muted,
  marginTop: 2,
};
const chipBase: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  padding: '2px 8px',
  borderRadius: 999,
};
const chipPublished: CSSProperties = { ...chipBase, background: COLORS.accent, color: '#fff' };
const chipDraft: CSSProperties = {
  ...chipBase,
  background: COLORS.surfaceAlt,
  color: COLORS.muted,
  border: `1px solid ${COLORS.border}`,
};
const caretStyle: CSSProperties = { color: COLORS.muted, fontSize: 12 };
const bodyStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
  padding: '4px 14px 16px',
  borderTop: `1px solid ${COLORS.border}`,
};
const actionsStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  flexWrap: 'wrap',
};
const toggleBase: CSSProperties = {
  height: 30,
  padding: '0 12px',
  borderRadius: 6,
  fontSize: 13,
  fontFamily: FONT,
  cursor: 'pointer',
};
const togglePublished: CSSProperties = {
  ...toggleBase,
  border: `1px solid ${COLORS.accent}`,
  background: COLORS.accentSoft,
  color: COLORS.accent,
};
const toggleDraft: CSSProperties = {
  ...toggleBase,
  border: `1px solid ${COLORS.border}`,
  background: COLORS.surface,
  color: COLORS.muted,
};
const saveButton: CSSProperties = {
  height: 30,
  padding: '0 16px',
  borderRadius: 6,
  border: 'none',
  background: COLORS.accent,
  color: '#fff',
  fontSize: 13,
  fontWeight: 600,
  fontFamily: FONT,
  cursor: 'pointer',
};
const deleteButton: CSSProperties = {
  height: 30,
  padding: '0 12px',
  borderRadius: 6,
  border: `1px solid ${COLORS.border}`,
  background: COLORS.surface,
  color: '#b3261e',
  fontSize: 13,
  fontFamily: FONT,
  cursor: 'pointer',
};

export const CaseStudyCard = ({
  row,
  expanded,
  busy,
  onToggleExpand,
  onChange,
  onSave,
  onDelete,
}: CaseStudyCardProps) => (
  <div style={cardStyle}>
    <div
      style={summaryStyle}
      onClick={onToggleExpand}
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onToggleExpand();
        }
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={titleStyle}>{row.headline.trim() !== '' ? row.headline : 'Untitled case study'}</div>
        {row.clientName.trim() !== '' ? <div style={clientStyle}>{row.clientName}</div> : null}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={row.published ? chipPublished : chipDraft}>{row.published ? 'Published' : 'Draft'}</span>
        <span style={caretStyle}>{expanded ? '▾' : '▸'}</span>
      </div>
    </div>

    {expanded ? (
      <div style={bodyStyle}>
        <Field label="Client">
          <TextInput value={row.clientName} onChange={(v) => onChange({ clientName: v })} placeholder="Client name" />
        </Field>
        <Field label="Title">
          <TextInput value={row.headline} onChange={(v) => onChange({ headline: v })} placeholder="What you delivered" />
        </Field>
        <Field label="Story">
          <MarkdownEditor value={row.bodyMarkdown} onChange={(v) => onChange({ bodyMarkdown: v })} placeholder="Tell the story of this project…" ariaLabel="Case study story" />
        </Field>
        <Field label="Case study link">
          <UrlInput value={row.caseStudyLink} onChange={(v) => onChange({ caseStudyLink: v })} placeholder="https://…" />
        </Field>
        <Field label="Cover image URL">
          <UrlInput
            value={row.coverImageUrl}
            onChange={(v) => onChange({ coverImageUrl: v })}
            placeholder="https://…"
          />
        </Field>
        {row.coverImageUrl.trim() !== '' ? (
          <img
            src={row.coverImageUrl}
            alt="Cover preview"
            style={{
              maxWidth: '100%',
              maxHeight: 160,
              objectFit: 'cover',
              borderRadius: 6,
              border: `1px solid ${COLORS.border}`,
            }}
          />
        ) : null}

        <div style={actionsStyle}>
          <button
            type="button"
            style={row.published ? togglePublished : toggleDraft}
            onClick={() => onChange({ published: !row.published })}
          >
            {row.published ? 'Published on your profile' : 'Draft (hidden from profile)'}
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" style={deleteButton} onClick={onDelete} disabled={busy}>
              Delete
            </button>
            <button type="button" style={saveButton} onClick={onSave} disabled={busy}>
              {busy ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    ) : null}
  </div>
);
