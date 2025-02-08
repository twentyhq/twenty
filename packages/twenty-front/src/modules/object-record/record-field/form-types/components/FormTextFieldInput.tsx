import { FormFieldInputContainer } from '@/object-record/record-field/form-types/components/FormFieldInputContainer';
import { FormFieldInputInputContainer } from '@/object-record/record-field/form-types/components/FormFieldInputInputContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/form-types/components/FormFieldInputRowContainer';
import { TextVariableEditor } from '@/object-record/record-field/form-types/components/TextVariableEditor';
import { useTextVariableEditor } from '@/object-record/record-field/form-types/hooks/useTextVariableEditor';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { parseEditorContent } from '@/workflow/workflow-variables/utils/parseEditorContent';
import { useId } from 'react';
import { isDefined } from 'twenty-shared';
import { InputErrorHelper } from '@/ui/input/components/InputErrorHelper';
import { InputHint } from '@/ui/input/components/InputHint';

type FormTextFieldInputProps = {
  label?: string;
  error?: string;
  hint?: string;
  defaultValue: string | undefined;
  placeholder: string;
  onPersist: (value: string) => void;
  onBlur?: () => void;
  multiline?: boolean;
  readonly?: boolean;
  VariablePicker?: VariablePickerComponent;
};

export const FormTextFieldInput = ({
  label,
  error,
  hint,
  defaultValue,
  placeholder,
  onPersist,
  onBlur,
  multiline,
  readonly,
  VariablePicker,
}: FormTextFieldInputProps) => {
  const inputId = useId();

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

  const handleVariableTagInsert = (variableName: string) => {
    if (!isDefined(editor)) {
      throw new Error(
        'Expected the editor to be defined when a variable is selected',
      );
    }

    editor.commands.insertVariableTag(variableName);
  };

  if (!isDefined(editor)) {
    return null;
  }

  return (
    <FormFieldInputContainer>
      {label ? <InputLabel>{label}</InputLabel> : null}

      <FormFieldInputRowContainer multiline={multiline}>
        <FormFieldInputInputContainer
          hasRightElement={isDefined(VariablePicker) && !readonly}
          multiline={multiline}
          onBlur={onBlur}
        >
          <TextVariableEditor
            editor={editor}
            multiline={multiline}
            readonly={readonly}
          />
        </FormFieldInputInputContainer>

        {VariablePicker && !readonly ? (
          <VariablePicker
            inputId={inputId}
            multiline={multiline}
            onVariableSelect={handleVariableTagInsert}
          />
        ) : null}
      </FormFieldInputRowContainer>
      {hint && <InputHint>{hint}</InputHint>}
      {error && <InputErrorHelper>{error}</InputErrorHelper>}
    </FormFieldInputContainer>
  );
};
