import { useLingui } from '@lingui/react/macro';
import { type Editor } from '@tiptap/core';
import { isDefined } from 'twenty-shared/utils';

import { FormAdvancedTextFieldInput } from '@/advanced-text-editor/components/FormAdvancedTextFieldInput';
import { useMentionSearch } from '@/mention/hooks/useMentionSearch';
import { RECORD_FORM_RICH_TEXT_EDITOR_PROFILE } from '@/object-record/record-field/ui/form-types/constants/RecordFormRichTextEditorProfile';
import { type FieldRichTextValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { getRichTextFieldSerializedContent } from '@/object-record/record-field/ui/utils/getRichTextFieldSerializedContent';

type FormRecordRichTextFieldInputProps = {
  label?: string;
  defaultValue: FieldRichTextValue | undefined;
  onChange: (value: FieldRichTextValue) => void;
  readonly?: boolean;
  placeholder?: string;
};

export const FormRecordRichTextFieldInput = ({
  label,
  defaultValue,
  placeholder,
  onChange,
  readonly,
}: FormRecordRichTextFieldInputProps) => {
  const { t } = useLingui();
  const { searchMentionRecords } = useMentionSearch();

  const handleChange = (tiptap: string) => {
    onChange({ blocknote: null, markdown: null, tiptap });
  };

  const handleEditorReady = (editor: Editor | null) => {
    if (!isDefined(editor)) {
      return;
    }

    editor.extensionStorage['mention-suggestion'].searchMentionRecords =
      searchMentionRecords;
  };

  return (
    <FormAdvancedTextFieldInput
      label={label}
      defaultValue={getRichTextFieldSerializedContent(defaultValue)}
      placeholder={placeholder ?? t`Type '/' for commands, '@' for mentions`}
      onChange={handleChange}
      onEditorReady={handleEditorReady}
      readonly={readonly}
      profile={RECORD_FORM_RICH_TEXT_EDITOR_PROFILE}
    />
  );
};
