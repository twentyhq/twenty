import { RecordFormTextInput } from '@/object-record/record-form/components/RecordFormTextInput';
import { t } from '@lingui/core/macro';

type RecordFormTextFieldInputProps = {
  label?: string;
  defaultValue?: string | null;
  onChange: (value: string) => void;
  readonly?: boolean;
  placeholder?: string;
};

export const RecordFormTextFieldInput = ({
  label,
  defaultValue,
  onChange,
  readonly,
  placeholder,
}: RecordFormTextFieldInputProps) => (
  <RecordFormTextInput
    label={label}
    value={defaultValue ?? ''}
    onChange={onChange}
    placeholder={placeholder ?? t`Enter text`}
    readonly={readonly}
  />
);
