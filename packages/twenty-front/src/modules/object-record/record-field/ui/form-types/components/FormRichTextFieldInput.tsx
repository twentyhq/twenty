import { useMemo } from 'react';
import { t } from '@lingui/core/macro';
import { Field } from 'twenty-ui/primitives/input';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { deserializeAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/deserializeAdvancedTextEditorDocument';
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
  readonly?: boolean;
  placeholder?: string;
  VariablePicker?: VariablePickerComponent;
  minHeight?: number;
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
  minHeight,
}: FormRichTextFieldInputProps) => {
  const storedValue = defaultValue?.blocknote ?? defaultValue?.markdown;
  const hasUnsupportedContent = useMemo(() => {
    if (!storedValue) {
      return false;
    }
    try {
      const document = deserializeAdvancedTextEditorDocument({
        serializedDocument: storedValue,
        parseLegacyDocument:
          RECORD_RICH_TEXT_EDITOR_PROFILE.parseLegacyDocument,
      });
      convertTipTapDocumentToBlockNote(JSON.stringify(document));
      return false;
    } catch {
      return true;
    }
  }, [storedValue]);

  if (hasUnsupportedContent) {
    return (
      <FormFieldInputContainer>
        {label ? <Field.Label>{label}</Field.Label> : null}
        <Field.Error
          match
        >{t`This content was saved in an older format and cannot be edited here`}</Field.Error>
      </FormFieldInputContainer>
    );
  }

  const handleChange = (value: string) => {
    onChange({
      // Record pages still read BlockNote, so convert at the field boundary.
      blocknote: convertTipTapDocumentToBlockNote(value),
      markdown: null,
    });
  };

  return (
    <FormAdvancedTextFieldInput
      label={label}
      error={error}
      hint={hint}
      defaultValue={storedValue}
      placeholder={placeholder}
      onChange={handleChange}
      readonly={readonly}
      VariablePicker={VariablePicker}
      profile={RECORD_RICH_TEXT_EDITOR_PROFILE}
      minHeight={minHeight}
    />
  );
};
