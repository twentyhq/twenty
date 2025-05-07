import { FormFieldInputContainer } from '@/object-record/record-field/form-types/components/FormFieldInputContainer';
import { FormFieldInputInnerContainer } from '@/object-record/record-field/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/form-types/components/FormFieldInputRowContainer';
import { TextVariableEditor } from '@/object-record/record-field/form-types/components/TextVariableEditor';
import { useTextVariableEditor } from '@/object-record/record-field/form-types/hooks/useTextVariableEditor';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { InputErrorHelper } from '@/ui/input/components/InputErrorHelper';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { useId } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { turnIntoEmptyStringIfWhitespacesOnly } from '~/utils/string/turnIntoEmptyStringIfWhitespacesOnly';

type FormRawJsonFieldInputProps = {
  label?: string;
  error?: string;
  defaultValue: string | null | undefined;
  onChange: (value: string | null) => void;
  onBlur?: () => void;
  readonly?: boolean;
  VariablePicker?: VariablePickerComponent;
  placeholder?: string;
};

export const FormRawJsonFieldInput = ({
  label,
  error,
  defaultValue,
  placeholder,
  onChange,
  onBlur,
  readonly,
  VariablePicker,
}: FormRawJsonFieldInputProps) => {
  const inputId = useId();

  const editor = useTextVariableEditor({
    placeholder: placeholder ?? 'Enter a JSON object',
    multiline: true,
    readonly,
    defaultValue: defaultValue ?? undefined,
    onUpdate: (editor) => {
      const text = turnIntoEmptyStringIfWhitespacesOnly(editor.getText());

      if (text === '') {
        onChange(null);

        return;
      }

      onChange(text);
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

      <FormFieldInputRowContainer multiline>
        <FormFieldInputInnerContainer
          hasRightElement={isDefined(VariablePicker) && !readonly}
          multiline
          onBlur={onBlur}
        >
          <TextVariableEditor editor={editor} multiline readonly={readonly} />
        </FormFieldInputInnerContainer>

        {VariablePicker && !readonly && (
          <VariablePicker
            inputId={inputId}
            multiline
            onVariableSelect={handleVariableTagInsert}
          />
        )}
      </FormFieldInputRowContainer>
      <InputErrorHelper>{error}</InputErrorHelper>
    </FormFieldInputContainer>
  );
};
