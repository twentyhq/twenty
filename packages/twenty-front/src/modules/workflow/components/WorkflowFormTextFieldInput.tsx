import { TextVariableEditor } from '@/object-record/record-field/form-types/components/TextVariableEditor';
import { useTextVariableEditor } from '@/object-record/record-field/form-types/hooks/useTextVariableEditor';
import { WorkflowFormFieldInput } from '@/workflow/components/WorkflowFormFieldInput';
import { parseEditorContent } from '@/workflow/search-variables/utils/parseEditorContent';
import { isDefined } from 'twenty-ui';

type WorkflowFormTextFieldInputProps = {
  defaultValue: string | undefined;
  placeholder: string;
  onPersist: (value: null | string) => void;
  multiline?: boolean;
  readonly?: boolean;
};

export const WorkflowFormTextFieldInput = ({
  defaultValue,
  placeholder,
  onPersist,
  multiline,
  readonly,
}: WorkflowFormTextFieldInputProps) => {
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
    <WorkflowFormFieldInput
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
