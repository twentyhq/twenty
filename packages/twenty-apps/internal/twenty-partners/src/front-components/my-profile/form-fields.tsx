import { useState, type ReactNode } from 'react';

export type SelectOption = { value: string; label: string };

export const COLORS = {
  bg: '#f7f7f8',
  surface: '#ffffff',
  surfaceAlt: '#f4f5f7',
  fg: '#1c1c1c',
  muted: '#66646a',
  border: '#e7e7eb',
  accent: '#4a38f5',
  accentSoft: 'rgba(74, 56, 245, 0.1)',
} as const;

export const FONT =
  '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';

const controlBase = {
  width: '100%',
  boxSizing: 'border-box',
  borderRadius: 8,
  border: `1px solid ${COLORS.border}`,
  background: COLORS.surface,
  color: COLORS.fg,
  fontSize: 14,
  fontFamily: FONT,
  outline: 'none',
} as const;

const inputStyle = { ...controlBase, height: 40, padding: '0 12px' } as const;

const labelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: COLORS.muted,
} as const;

const chipBase = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  height: 28,
  padding: '0 10px',
  borderRadius: 999,
  fontSize: 12.5,
  fontFamily: FONT,
  cursor: 'pointer',
  border: `1px solid ${COLORS.border}`,
  background: COLORS.surface,
  color: COLORS.fg,
} as const;

const chipSelected = {
  ...chipBase,
  border: `1px solid ${COLORS.accent}`,
  background: COLORS.accentSoft,
  color: COLORS.accent,
  fontWeight: 600,
} as const;

export const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <span style={labelStyle}>{label}</span>
    {children}
  </div>
);

export const TextInput = ({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) => (
  <input
    style={inputStyle}
    value={value}
    placeholder={placeholder}
    onChange={(event) => onChange(event.target.value)}
  />
);

export const TextArea = ({
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) => (
  <textarea
    style={{ ...controlBase, padding: '10px 12px', resize: 'vertical', lineHeight: 1.5 }}
    rows={rows}
    value={value}
    placeholder={placeholder}
    onChange={(event) => onChange(event.target.value)}
  />
);

const CARET =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6' fill='none' stroke='%2366646a' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M1 1l4 4 4-4'/%3E%3C/svg%3E\")";

export const SelectInput = ({
  value,
  options,
  onChange,
  placeholder = 'Select…',
}: {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
}) => (
  <select
    style={{
      ...inputStyle,
      appearance: 'none',
      WebkitAppearance: 'none',
      MozAppearance: 'none',
      backgroundImage: CARET,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 12px center',
      paddingRight: 32,
      cursor: 'pointer',
    }}
    value={value}
    onChange={(event) => onChange(event.target.value)}
  >
    <option value="">{placeholder}</option>
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

export const ChipMultiSelect = ({
  value,
  options,
  onChange,
}: {
  value: string[];
  options: SelectOption[];
  onChange: (value: string[]) => void;
}) => {
  const toggle = (optionValue: string) => {
    onChange(
      value.includes(optionValue)
        ? value.filter((item) => item !== optionValue)
        : [...value, optionValue],
    );
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {options.map((option) => {
        const selected = value.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            style={selected ? chipSelected : chipBase}
            onClick={() => toggle(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

// Free-text tag input with clickable suggestion pills — the same "suggest but let
// them add their own" concept as the website skills field.
export const TagInput = ({
  value,
  suggestions,
  onChange,
  placeholder,
}: {
  value: string[];
  suggestions: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}) => {
  const [draft, setDraft] = useState('');

  const add = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed !== '' && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setDraft('');
  };

  const remove = (tag: string) => onChange(value.filter((item) => item !== tag));

  const unusedSuggestions = suggestions.filter((tag) => !value.includes(tag));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {value.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {value.map((tag) => (
            <span key={tag} style={chipSelected}>
              {tag}
              <span
                role="button"
                tabIndex={0}
                aria-label={`Remove ${tag}`}
                onClick={() => remove(tag)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    remove(tag);
                  }
                }}
                style={{ cursor: 'pointer', opacity: 0.7, fontSize: 14, lineHeight: 1 }}
              >
                ×
              </span>
            </span>
          ))}
        </div>
      )}
      <input
        style={inputStyle}
        value={draft}
        placeholder={placeholder ?? 'Type a skill and press Enter'}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            add(draft);
          }
        }}
      />
      {unusedSuggestions.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {unusedSuggestions.map((tag) => (
            <button key={tag} type="button" style={chipBase} onClick={() => add(tag)}>
              + {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const CurrencyInput = ({
  amount,
  currencyCode,
  onChange,
}: {
  amount: number | null;
  currencyCode: string;
  onChange: (next: { amount: number | null; currencyCode: string }) => void;
}) => (
  <div style={{ display: 'flex', gap: 8 }}>
    <input
      style={{ ...inputStyle, flex: 1 }}
      type="text"
      inputMode="decimal"
      value={amount == null ? '' : String(amount)}
      placeholder="0"
      onChange={(event) => {
        const cleaned = event.target.value.replace(/[^0-9.]/g, '');
        const next = Number(cleaned);
        onChange({
          amount: cleaned === '' || Number.isNaN(next) ? null : next,
          currencyCode,
        });
      }}
    />
    <div
      style={{
        ...inputStyle,
        width: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: COLORS.muted,
        background: COLORS.surfaceAlt,
      }}
    >
      {currencyCode || 'USD'}
    </div>
  </div>
);

export const UrlInput = ({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) => (
  <input
    style={inputStyle}
    type="url"
    value={value}
    placeholder={placeholder}
    onChange={(event) => onChange(event.target.value)}
  />
);
