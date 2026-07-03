import type { ChangeEvent, CSSProperties } from 'react';

import type { SelectOption } from 'src/constants/my-profile.constants';

// twenty-sdk/ui re-exports twenty-ui-deprecated, which is not installed in this
// app's node_modules — importing from it currently resolves to `any` rather
// than a real component type, so these stay plain, correctly-typed inputs.
const fieldWrapperStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  marginBottom: 12,
};

const labelTextStyle: CSSProperties = { fontSize: 13, opacity: 0.7 };

const inputStyle: CSSProperties = {
  padding: '8px 10px',
  fontSize: 14,
  border: '1px solid rgba(0, 0, 0, 0.15)',
  borderRadius: 4,
  fontFamily: 'inherit',
};

const chipStyle: CSSProperties = {
  padding: '2px 8px',
  fontSize: 12,
  borderRadius: 999,
  background: 'rgba(0, 0, 0, 0.06)',
};

export type CurrencyValue = { amountMicros: string; currencyCode: string };

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export const TextField = ({ label, value, onChange, placeholder }: TextFieldProps) => (
  <label style={fieldWrapperStyle}>
    <span style={labelTextStyle}>{label}</span>
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
      style={inputStyle}
    />
  </label>
);

type TextAreaFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
};

export const TextAreaField = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: TextAreaFieldProps) => (
  <label style={fieldWrapperStyle}>
    <span style={labelTextStyle}>{label}</span>
    <textarea
      value={value}
      placeholder={placeholder}
      rows={rows}
      onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value)}
      style={{ ...inputStyle, resize: 'vertical' }}
    />
  </label>
);

type SelectFieldProps = {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
};

export const SelectField = ({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select…',
}: SelectFieldProps) => (
  <label style={fieldWrapperStyle}>
    <span style={labelTextStyle}>{label}</span>
    <select
      value={value}
      onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange(event.target.value)}
      style={inputStyle}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);

type MultiSelectFieldProps = {
  label: string;
  value: string[];
  options: SelectOption[];
  onChange: (value: string[]) => void;
};

export const MultiSelectField = ({ label, value, options, onChange }: MultiSelectFieldProps) => {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(event.target.selectedOptions).map((option) => option.value);
    onChange(selected);
  };

  return (
    <label style={fieldWrapperStyle}>
      <span style={labelTextStyle}>{label}</span>
      <select
        multiple
        value={value}
        onChange={handleChange}
        style={{ ...inputStyle, height: 120 }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
};

type CurrencyFieldProps = {
  label: string;
  value: CurrencyValue | null;
  onChange: (value: CurrencyValue | null) => void;
};

export const CurrencyField = ({ label, value, onChange }: CurrencyFieldProps) => {
  const amountMicros = value?.amountMicros ?? '';
  const currencyCode = value?.currencyCode ?? '';

  const emitChange = (nextAmountMicros: string, nextCurrencyCode: string) => {
    if (nextAmountMicros.trim() === '' && nextCurrencyCode.trim() === '') {
      onChange(null);
      return;
    }
    onChange({ amountMicros: nextAmountMicros, currencyCode: nextCurrencyCode });
  };

  return (
    <div style={fieldWrapperStyle}>
      <span style={labelTextStyle}>{label}</span>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={amountMicros}
          placeholder="Amount (micros)"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            emitChange(event.target.value, currencyCode)
          }
          style={inputStyle}
        />
        <input
          type="text"
          value={currencyCode}
          placeholder="USD"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            emitChange(amountMicros, event.target.value)
          }
          style={{ ...inputStyle, maxWidth: 80 }}
        />
      </div>
    </div>
  );
};

type UrlFieldProps = {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
};

export const UrlField = ({ label, value, onChange, placeholder }: UrlFieldProps) => (
  <label style={fieldWrapperStyle}>
    <span style={labelTextStyle}>{label}</span>
    <input
      type="url"
      value={value ?? ''}
      placeholder={placeholder}
      onChange={(event: ChangeEvent<HTMLInputElement>) => {
        const next = event.target.value;
        onChange(next.trim() === '' ? null : next);
      }}
      style={inputStyle}
    />
  </label>
);

type NumberFieldProps = {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
};

export const NumberField = ({ label, value, onChange, placeholder }: NumberFieldProps) => (
  <label style={fieldWrapperStyle}>
    <span style={labelTextStyle}>{label}</span>
    <input
      type="number"
      value={value ?? ''}
      placeholder={placeholder}
      onChange={(event: ChangeEvent<HTMLInputElement>) => {
        const next = event.target.value;
        onChange(next.trim() === '' ? null : Number(next));
      }}
      style={inputStyle}
    />
  </label>
);

type ReadOnlyChipsProps = {
  label: string;
  values: string[] | null;
};

export const ReadOnlyChips = ({ label, values }: ReadOnlyChipsProps) => (
  <div style={fieldWrapperStyle}>
    <span style={labelTextStyle}>{label}</span>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {values && values.length > 0 ? (
        values.map((value) => (
          <span key={value} style={chipStyle}>
            {value}
          </span>
        ))
      ) : (
        <span style={{ opacity: 0.5, fontSize: 13 }}>—</span>
      )}
    </div>
  </div>
);
