import { useLingui } from '@lingui/react/macro';
import { type Editor } from '@tiptap/core';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { FormAdvancedTextFieldInput } from '@/advanced-text-editor/components/FormAdvancedTextFieldInput';
import { type UploadedFile } from '@/advanced-text-editor/types/UploadedFile';
import { useMentionSearch } from '@/mention/hooks/useMentionSearch';
import { RECORD_FORM_RICH_TEXT_EDITOR_PROFILE } from '@/object-record/record-field/ui/form-types/constants/RecordFormRichTextEditorProfile';
import { type FieldRichTextValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { getRichTextFieldEditorDocument } from '@/object-record/record-field/ui/utils/getRichTextFieldEditorDocument';

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
  const { enqueueToast } = useToast();
  const { searchMentionRecords } = useMentionSearch();

  const handleUploadFile = (): Promise<UploadedFile> =>
    Promise.reject(new Error(t`Save the record before attaching a file`));

  const handleUploadFileError = (error: Error) => {
    enqueueToast({ status: 'error', children: error.message });
  };

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
      defaultValue={getRichTextFieldEditorDocument(defaultValue)}
      placeholder={placeholder ?? t`Type '/' for commands, '@' for mentions`}
      onChange={handleChange}
      onEditorReady={handleEditorReady}
      readonly={readonly}
      onImageUpload={handleUploadFile}
      onImageUploadError={handleUploadFileError}
      onFileUpload={handleUploadFile}
      onFileUploadError={handleUploadFileError}
      profile={RECORD_FORM_RICH_TEXT_EDITOR_PROFILE}
    />
  );
};
