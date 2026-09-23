import { parseLegacyRecordRichTextDocument } from '@/object-record/record-field/ui/form-types/utils/parseLegacyRecordRichTextDocument';
import { isNonEmptyString } from '@sniptt/guards';
import { useMemo } from 'react';
import { t } from '@lingui/core/macro';
import { Field } from 'twenty-ui/primitives/input';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { deserializeAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/deserializeAdvancedTextEditorDocument';
import { FormAdvancedTextFieldInput } from '@/advanced-text-editor/components/FormAdvancedTextFieldInput';
import { type AdvancedTextEditorProfile } from '@/advanced-text-editor/types/AdvancedTextEditorProfile';
import { RECORD_RICH_TEXT_EDITOR_PROFILE } from '@/object-record/record-field/ui/form-types/constants/RecordRichTextEditorProfile';
import { FormSubmitShortcut } from '@/object-record/record-field/ui/form-types/extensions/FormSubmitShortcut';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { type FieldRichTextValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { convertTipTapDocumentToBlockNote } from '@/object-record/record-field/ui/form-types/utils/convertTipTapDocumentToBlockNote';
import { serializeTipTapDocumentContent } from '@/object-record/record-field/ui/form-types/utils/serializeTipTapDocumentContent';

type FormRichTextFieldInputProps = {
  label?: string;
  error?: string;
  hint?: string;
  defaultValue: FieldRichTextValue | undefined;
  onChange: (value: FieldRichTextValue) => void;
  readonly?: boolean;
  placeholder?: string;
  VariablePicker?: VariablePickerComponent;
  enableVariables?: boolean;
  formSubmitsOnModEnter?: boolean;
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
  enableVariables = false,
  formSubmitsOnModEnter = false,
}: FormRichTextFieldInputProps) => {
  const profile = useMemo(
    (): AdvancedTextEditorProfile => ({
      ...RECORD_RICH_TEXT_EDITOR_PROFILE,
      buildExtensions: (context) => [
        ...RECORD_RICH_TEXT_EDITOR_PROFILE.buildExtensions(context),
        ...(formSubmitsOnModEnter ? [FormSubmitShortcut] : []),
      ],
      parseLegacyDocument: (value: string) =>
        parseLegacyRecordRichTextDocument({
          serializedDocument: value,
          enableVariables,
        }),
    }),
    [enableVariables, formSubmitsOnModEnter],
  );
  const storedValue = defaultValue?.blocknote ?? defaultValue?.markdown;
  const hasUnsupportedContent = useMemo(() => {
    if (!isNonEmptyString(storedValue)) {
      return false;
    }
    try {
      const document = deserializeAdvancedTextEditorDocument({
        serializedDocument: storedValue,
        parseLegacyDocument: profile.parseLegacyDocument,
      });
      if (!enableVariables) {
        convertTipTapDocumentToBlockNote(JSON.stringify(document));
      }
      return false;
    } catch {
      return true;
    }
  }, [storedValue, profile, enableVariables]);

  if (hasUnsupportedContent) {
    return (
      <FormFieldInputContainer>
        {label ? <Field.Label>{label}</Field.Label> : null}
        <Field.Error
          match
        >{t`This content uses formatting that can't be edited here`}</Field.Error>
      </FormFieldInputContainer>
    );
  }

  const handleChange = (value: string) => {
    onChange({
      // Workflow resolution requires semantic tags; record pages require BlockNote.
      blocknote: enableVariables
        ? serializeTipTapDocumentContent(value)
        : convertTipTapDocumentToBlockNote(value),
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
      profile={profile}
    />
  );
};
