import { FormAdvancedTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormAdvancedTextFieldInput';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { type FieldRichTextV2Value } from '@/object-record/record-field/ui/types/FieldMetadata';

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

const RICH_TEXT_V2_EDITOR_MIN_HEIGHT = 340;

const RICH_TEXT_V2_EDITOR_MAX_WIDTH = 600;

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

export const FormRichTextV2FieldInput = ({
  label,
  error,
  hint,
  defaultValue,
  placeholder,
  onChange,
  readonly,
  VariablePicker,
}: FormRichTextV2FieldInputProps) => {
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
      minHeight={RICH_TEXT_V2_EDITOR_MIN_HEIGHT}
      maxWidth={RICH_TEXT_V2_EDITOR_MAX_WIDTH}
    />
  );
};
