import { FormFieldInput } from '@/object-record/record-field/form-types/components/FormFieldInputBase';
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
  // TODO: Might use a specific editor that doesn't know about variables (more lightweight)
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
      Input={
        <TextVariableEditor
          editor={editor}
          multiline={multiline}
          readonly={readonly}
        />
      }
      multiline={multiline}
    />
  );
};
