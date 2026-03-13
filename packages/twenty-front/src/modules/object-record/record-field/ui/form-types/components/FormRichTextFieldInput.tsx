import { FormAdvancedTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormAdvancedTextFieldInput';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { type FieldRichTextValue } from '@/object-record/record-field/ui/types/FieldMetadata';

type FormRichTextFieldInputProps = {
  label?: string;
  error?: string;
  hint?: string;
  defaultValue: FieldRichTextValue | undefined;
  onChange: (value: FieldRichTextValue) => void;
  onBlur?: () => void;
  readonly?: boolean;
  placeholder?: string;
  VariablePicker?: VariablePickerComponent;
};

const RICH_TEXT_EDITOR_MIN_HEIGHT = 340;

const RICH_TEXT_EDITOR_MAX_WIDTH = 600;

const mapTipTapToBlockNote = (tiptapJson: string): string => {
  try {
    const json = JSON.parse(tiptapJson);
    if (json.type === 'doc' && Array.isArray(json.content)) {
      return JSON.stringify(json.content);
    }
    return tiptapJson;
  } catch {
    return tiptapJson;
  }
};

export const FormRichTextFieldInput = ({
  label,
  error,
  hint,
  defaultValue,
  placeholder,
  onChange,
  readonly,
  VariablePicker,
}: FormRichTextFieldInputProps) => {
  const handleChange = (value: string) => {
    onChange({
      blocknote: mapTipTapToBlockNote(value),
      markdown: null,
    });
  };

  return (
    <FormAdvancedTextFieldInput
      label={label}
      error={error}
      hint={hint}
      defaultValue={defaultValue?.blocknote ?? defaultValue?.markdown}
      placeholder={placeholder}
      onChange={handleChange}
      readonly={readonly}
      VariablePicker={VariablePicker}
      minHeight={RICH_TEXT_EDITOR_MIN_HEIGHT}
      maxWidth={RICH_TEXT_EDITOR_MAX_WIDTH}
    />
  );
};
