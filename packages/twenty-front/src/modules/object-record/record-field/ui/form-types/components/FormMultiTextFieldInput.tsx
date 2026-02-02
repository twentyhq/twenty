import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { TextVariableEditor } from '@/object-record/record-field/ui/form-types/components/TextVariableEditor';
import { useMultiItemFieldEditor } from '@/object-record/record-field/ui/form-types/hooks/useMultiItemFieldEditor';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { parseMultiItemEditorContent } from '@/workflow/workflow-variables/utils/parseMultiItemEditorContent';
import { t } from '@lingui/core/macro';
import { useId } from 'react';
import { isDefined } from 'twenty-shared/utils';

type FormMultiTextFieldInputProps = {
  label?: string;
  defaultValue: string | undefined | null;
  onChange: (value: string) => void;
  readonly?: boolean;
  placeholder?: string;
  VariablePicker?: VariablePickerComponent;
};

export const FormMultiTextFieldInput = ({
  label,
  defaultValue,
  placeholder,
  onChange,
  readonly,
  VariablePicker,
}: FormMultiTextFieldInputProps) => {
  const instanceId = useId();

  const editor = useMultiItemFieldEditor({
    placeholder: placeholder ?? t`Enter values, comma-separated`,
    readonly,
    defaultValue,
    onUpdate: (editor) => {
      const jsonContent = editor.getJSON();
      const parsedContent = parseMultiItemEditorContent(jsonContent);

      onChange(parsedContent);
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

      <FormFieldInputRowContainer multiline={false}>
        <FormFieldInputInnerContainer
          formFieldInputInstanceId={instanceId}
          hasRightElement={isDefined(VariablePicker) && !readonly}
          multiline={false}
        >
          <TextVariableEditor
            editor={editor}
            multiline={false}
            readonly={readonly}
          />
        </FormFieldInputInnerContainer>

        {VariablePicker && !readonly ? (
          <VariablePicker
            instanceId={instanceId}
            multiline={false}
            onVariableSelect={handleVariableTagInsert}
          />
        ) : null}
      </FormFieldInputRowContainer>
    </FormFieldInputContainer>
  );
};
