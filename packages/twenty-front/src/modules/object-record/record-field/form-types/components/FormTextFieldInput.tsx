import { FormFieldInput } from '@/object-record/record-field/form-types/components/FormFieldInput';
import { TextVariableEditor } from '@/object-record/record-field/form-types/components/TextVariableEditor';
import { useTextVariableEditor } from '@/object-record/record-field/form-types/hooks/useTextVariableEditor';
import { parseEditorContent } from '@/workflow/search-variables/utils/parseEditorContent';
import { isDefined } from 'twenty-ui';

type FormTextFieldInputProps = {
  defaultValue: string | undefined;
  placeholder: string;
  onPersist: (value: null | string) => void;
  multiline?: boolean;
  readonly?: boolean;
};

export const FormTextFieldInput = ({
  defaultValue,
  placeholder,
  onPersist,
  multiline,
  readonly,
}: FormTextFieldInputProps) => {
  const editor = useTextVariableEditor({
    placeholder,
    multiline,
    readonly,
    defaultValue,
    onUpdate: (editor) => {
      const jsonContent = editor.getJSON();
      const parsedContent = parseEditorContent(jsonContent);

      onPersist(parsedContent);
    },
  });

  if (!isDefined(editor)) {
    return null;
  }

  return (
    <FormFieldInput
      variableMode="full-editor"
      readonly={readonly}
      Input={
        <TextVariableEditor
          editor={editor}
          multiline={multiline}
          readonly={readonly}
        />
      }
      multiline={multiline}
      onVariableTagInsert={(variable) => {
        editor.commands.insertVariableTag(variable);
      }}
    />
  );
};
