import { defineFrontComponent } from 'twenty-sdk/define';
import { type ChangeEvent, useState } from 'react';

const CARD_STYLE = {
  padding: 24,
  backgroundColor: '#eff6ff',
  border: '2px solid #3b82f6',
  borderRadius: 12,
  fontFamily: 'system-ui, sans-serif',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 16,
  maxWidth: 400,
};

const HEADING_STYLE = {
  color: '#1e3a8a',
  fontWeight: 700,
  fontSize: 18,
  margin: 0,
};

const LABEL_STYLE = {
  fontSize: 13,
  fontWeight: 600,
  color: '#374151',
};

const HINT_STYLE = {
  fontSize: 13,
  color: '#6b7280',
  fontFamily: 'monospace',
};

const INPUT_STYLE = {
  padding: '8px 12px',
  border: '1px solid #d1d5db',
  borderRadius: 6,
  fontSize: 14,
  fontFamily: 'monospace',
};

const INITIAL_VALUE = 'Hello world';

const CaretPreservationComponent = () => {
  const [text, setText] = useState(INITIAL_VALUE);
  const [textareaText, setTextareaText] = useState(INITIAL_VALUE);

  return (
    <div data-testid="caret-preservation-component" style={CARD_STYLE}>
      <h2 style={HEADING_STYLE}>Caret Preservation</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={LABEL_STYLE}>Text input (pre-filled)</label>
        <input
          data-testid="caret-text-input"
          type="text"
          value={text}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            const detail = (event as unknown as { detail: { value?: string } })
              .detail;
            setText(detail?.value ?? '');
          }}
          style={INPUT_STYLE}
        />
        <span data-testid="caret-text-value" style={HINT_STYLE}>
          {text}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={LABEL_STYLE}>Textarea (pre-filled)</label>
        <textarea
          data-testid="caret-textarea-input"
          value={textareaText}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
            const detail = (event as unknown as { detail: { value?: string } })
              .detail;
            setTextareaText(detail?.value ?? '');
          }}
          style={INPUT_STYLE}
          rows={3}
        />
        <span data-testid="caret-textarea-value" style={HINT_STYLE}>
          {textareaText}
        </span>
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'test-caret-00000000-0000-0000-0000-000000000021',
  name: 'caret-preservation-component',
  description:
    'Component verifying caret position is preserved during mid-string editing of <input>/<textarea>',
  component: CaretPreservationComponent,
});
