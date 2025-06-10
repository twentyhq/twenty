import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { FieldRichTextV2Value } from '@/object-record/record-field/types/FieldMetadata';

type FormRichTextV2FieldInputProps = {
  label?: string;
  error?: string;
  hint?: string;
  defaultValue: FieldRichTextV2Value | undefined;
  onChange: (value: FieldRichTextV2Value) => void;
  onBlur?: () => void;
  readonly?: boolean;
  placeholder?: string;
  VariablePicker?: VariablePickerComponent;
};

export const FormRichTextV2FieldInput = ({
  label,
  error,
  hint,
  defaultValue,
  placeholder,
  onChange,
  onBlur,
  readonly,
  VariablePicker,
}: FormRichTextV2FieldInputProps) => {
  const handleChange = (value: string) => {
    onChange({
      blocknote: null,
      markdown: value,
    });
  };

  return (
    <FormTextFieldInput
      label={label}
      error={error}
      hint={hint}
      defaultValue={defaultValue?.markdown ?? ''}
      placeholder={placeholder}
      onChange={handleChange}
      onBlur={onBlur}
      multiline
      readonly={readonly}
      VariablePicker={VariablePicker}
    />
  );
};
