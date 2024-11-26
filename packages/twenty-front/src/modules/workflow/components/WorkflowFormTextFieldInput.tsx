import { TextVariableEditor } from '@/object-record/record-field/form-types/components/TextVariableEditor';
import { useTextVariableEditor } from '@/object-record/record-field/form-types/hooks/useTextVariableEditor';
import { WorkflowFormFieldInputBase } from '@/workflow/components/WorkflowFormFieldInputBase';
import { parseEditorContent } from '@/workflow/search-variables/utils/parseEditorContent';
import { isDefined } from 'twenty-ui';

type WorkflowFormTextFieldInputProps = {
  label?: string;
  defaultValue: string | undefined;
  placeholder: string;
  onPersist: (value: null | string) => void;
  multiline?: boolean;
  readonly?: boolean;
};

export const WorkflowFormTextFieldInput = ({
  label,
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

  const onVariableTagInsert = (variable: string) => {
    if (!isDefined(editor)) {
      throw new Error(
        'Expected the editor to be defined when a variable is selected',
      );
    }

    editor.commands.insertVariableTag(variable);
  };

  if (!isDefined(editor)) {
    return null;
  }

  return (
    <WorkflowFormFieldInputBase
      label={label}
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
      onVariableTagInsert={onVariableTagInsert}
    />
  );
};
