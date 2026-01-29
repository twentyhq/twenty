import { t } from '@lingui/core/macro';
import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { InputLabel } from '@/ui/input/components/InputLabel';

type FormFilesFieldInputProps = {
  label?: string;
  defaultValue?: FieldFilesValue;
  onChange: (value: FieldFilesValue) => void;
  VariablePicker?: VariablePickerComponent;
  readonly?: boolean;
  placeholder?: string;
};

export const FormFilesFieldInput = ({
  label,
  defaultValue,
  onChange,
  readonly,
  VariablePicker,
  placeholder,
}: FormFilesFieldInputProps) => {
  // For form input, we'll handle FILES as a JSON string for simplicity
  // Users can input JSON array of file objects
  const handleChange = (value: string) => {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        onChange(parsed);
      }
    } catch {
      // If parsing fails, ignore the update
    }
  };

  const stringValue = defaultValue ? JSON.stringify(defaultValue, null, 2) : '';

  return (
    <FormFieldInputContainer>
      {label ? <InputLabel>{label}</InputLabel> : null}
      <FormTextFieldInput
        label={label}
        defaultValue={stringValue}
        onChange={handleChange}
        placeholder={placeholder ?? t`Files (JSON array)`}
        readonly={readonly}
        VariablePicker={VariablePicker}
      />
    </FormFieldInputContainer>
  );
};
