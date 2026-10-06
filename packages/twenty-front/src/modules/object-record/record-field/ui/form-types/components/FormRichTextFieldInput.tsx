import { FormAdvancedTextFieldInput } from '@/advanced-text-editor/components/FormAdvancedTextFieldInput';
import { RECORD_RICH_TEXT_EDITOR_PROFILE } from '@/object-record/record-field/ui/form-types/constants/RecordRichTextEditorProfile';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { type FieldRichTextValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { convertTipTapDocumentToBlockNote } from '@/object-record/record-field/ui/form-types/utils/convertTipTapDocumentToBlockNote';

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
      // TODO: drop once RICH_TEXT migrates off the legacy BlockNote array contract.
      blocknote: convertTipTapDocumentToBlockNote(value),
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
      profile={RECORD_RICH_TEXT_EDITOR_PROFILE}
    />
  );
};
