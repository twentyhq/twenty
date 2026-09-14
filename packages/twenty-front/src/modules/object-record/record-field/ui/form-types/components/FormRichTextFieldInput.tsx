import { BLOCK_SCHEMA } from '@/blocknote-editor/blocks/Schema';
import { BlockEditor } from '@/blocknote-editor/components/BlockEditor';
import { parseInitialBlocknote } from '@/blocknote-editor/utils/parseInitialBlocknote';
import { type FieldRichTextValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { useLingui } from '@lingui/react/macro';
import { useCreateBlockNote } from '@blocknote/react';
import { Field } from 'twenty-ui/input';

type FormRichTextFieldInputProps = {
  label?: string;
  error?: string;
  hint?: string;
  defaultValue: FieldRichTextValue | undefined;
  onChange: (value: FieldRichTextValue) => void;
  readonly?: boolean;
  placeholder?: string;
};

export const FormRichTextFieldInput = ({
  label,
  error,
  hint,
  defaultValue,
  placeholder,
  onChange,
  readonly,
}: FormRichTextFieldInputProps) => {
  const { t } = useLingui();

  const editor = useCreateBlockNote({
    initialContent: parseInitialBlocknote(defaultValue?.blocknote),
    domAttributes: { editor: { class: 'editor' } },
    schema: BLOCK_SCHEMA,
    placeholders: {
      default: placeholder ?? t`Type '/' for commands`,
    },
  });

  const handleChange = () => {
    onChange({
      blocknote: JSON.stringify(editor.document),
      markdown: null,
    });
  };

  return (
    <FormFieldInputContainer>
      {label ? <Field.Label>{label}</Field.Label> : null}
      <BlockEditor
        editor={editor}
        onChange={handleChange}
        readonly={readonly}
      />
      {hint && <Field.Description>{hint}</Field.Description>}
      {error && <Field.Error match>{error}</Field.Error>}
    </FormFieldInputContainer>
  );
};
