import { themeCssVariables } from 'twenty-ui/theme';

const labelStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: themeCssVariables.spacing[1],
  fontFamily: themeCssVariables.font.family,
  fontSize: themeCssVariables.font.size.sm,
  color: themeCssVariables.font.color.secondary,
} as const;

const inputStyle = {
  backgroundColor: themeCssVariables.background.transparent.lighter,
  border: `1px solid ${themeCssVariables.border.color.medium}`,
  borderRadius: themeCssVariables.border.radius.md,
  boxSizing: 'border-box',
  color: themeCssVariables.font.color.primary,
  fontFamily: themeCssVariables.font.family,
  fontSize: themeCssVariables.font.size.md,
  height: '32px',
  padding: themeCssVariables.spacing[2],
  width: '100%',
} as const;

type SendWhatsAppTemplateFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  disabled: boolean;
  onChange: (value: string) => void;
};

export const SendWhatsAppTemplateField = ({
  label,
  value,
  placeholder,
  disabled,
  onChange,
}: SendWhatsAppTemplateFieldProps) => (
  <label style={labelStyle}>
    {label}
    <input
      style={inputStyle}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    />
  </label>
);
