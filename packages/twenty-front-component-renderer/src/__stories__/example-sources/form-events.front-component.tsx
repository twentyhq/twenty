import { defineFrontComponent } from 'twenty-sdk/define';
import { type ChangeEvent, useState } from 'react';

const CARD_STYLE = {
  padding: 24,
  backgroundColor: '#f0fdf4',
  border: '2px solid #22c55e',
  borderRadius: 12,
  fontFamily: 'system-ui, sans-serif',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 16,
  maxWidth: 400,
};

const HEADING_STYLE = {
  color: '#166534',
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
};

const INPUT_STYLE = {
  padding: '8px 12px',
  border: '1px solid #d1d5db',
  borderRadius: 6,
  fontSize: 14,
};

const SUBMIT_BUTTON_STYLE = {
  padding: '10px 20px',
  backgroundColor: '#16a34a',
  color: 'white',
  border: 'none',
  borderRadius: 6,
  fontWeight: 600,
  cursor: 'pointer',
};

const FormEventsComponent = () => {
  const [textValue, setTextValue] = useState('');
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [focusState, setFocusState] = useState('none');
  const [submittedData, setSubmittedData] = useState<string | null>(null);

  return (
    <div data-testid="form-events-component" style={CARD_STYLE}>
      <h2 style={HEADING_STYLE}>Form Events</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={LABEL_STYLE}>Text Input</label>
        <input
          data-testid="text-input"
          type="text"
          placeholder="Type here..."
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            const detail = (event as unknown as { detail: { value?: string } })
              .detail;
            setTextValue(detail?.value ?? '');
          }}
          onFocus={() => setFocusState('focused')}
          onBlur={() => setFocusState('blurred')}
          style={INPUT_STYLE}
        />
        <span data-testid="text-value" style={HINT_STYLE}>
          {textValue}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          data-testid="checkbox-input"
          type="checkbox"
          checked={checkboxValue}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            const detail = (
              event as unknown as { detail: { checked?: boolean } }
            ).detail;
            setCheckboxValue(detail?.checked ?? false);
          }}
        />
        <label style={LABEL_STYLE}>Check me</label>
        <span data-testid="checkbox-value" style={HINT_STYLE}>
          {String(checkboxValue)}
        </span>
      </div>

      <span data-testid="focus-state" style={HINT_STYLE}>
        {focusState}
      </span>

      <button
        data-testid="submit-button"
        type="button"
        onClick={() =>
          setSubmittedData(
            JSON.stringify({ text: textValue, checkbox: checkboxValue }),
          )
        }
        style={SUBMIT_BUTTON_STYLE}
      >
        Submit
      </button>

      {submittedData !== null && (
        <pre
          data-testid="submitted-data"
          style={{
            fontSize: 13,
            background: '#dcfce7',
            padding: 12,
            borderRadius: 8,
            margin: 0,
            overflow: 'auto',
          }}
        >
          {submittedData}
        </pre>
      )}
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'test-form-00000000-0000-0000-0000-000000000020',
  name: 'form-events-component',
  description:
    'Component testing form input events (onChange, onFocus, onBlur, submit)',
  component: FormEventsComponent,
});
