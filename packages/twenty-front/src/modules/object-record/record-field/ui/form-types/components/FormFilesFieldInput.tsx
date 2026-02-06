import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { TextVariableEditor } from '@/object-record/record-field/ui/form-types/components/TextVariableEditor';
import { useTextVariableEditor } from '@/object-record/record-field/ui/form-types/hooks/useTextVariableEditor';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { InputErrorHelper } from '@/ui/input/components/InputErrorHelper';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { t } from '@lingui/core/macro';
import { useId } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { turnIntoEmptyStringIfWhitespacesOnly } from '~/utils/string/turnIntoEmptyStringIfWhitespacesOnly';

type FormFilesFieldInputProps = {
  label?: string;
  error?: string;
  defaultValue: string | null | undefined | unknown;
  onChange: (value: string | null) => void;
  onBlur?: () => void;
  readonly?: boolean;
  VariablePicker?: VariablePickerComponent;
  placeholder?: string;
};

export const FormFilesFieldInput = ({
  label,
  error,
  defaultValue,
  placeholder,
  onChange,
  onBlur,
  readonly,
  VariablePicker,
}: FormFilesFieldInputProps) => {
  const instanceId = useId();

  const stringDefaultValue =
    typeof defaultValue === 'string'
      ? defaultValue
      : defaultValue
        ? JSON.stringify(defaultValue)
        : undefined;

  const editor = useTextVariableEditor({
    placeholder: placeholder ?? t`Enter files as JSON array`,
    multiline: true,
    readonly,
    defaultValue: stringDefaultValue,
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
          formFieldInputInstanceId={instanceId}
          hasRightElement={isDefined(VariablePicker) && !readonly}
          multiline
          onBlur={onBlur}
        >
          <TextVariableEditor editor={editor} multiline readonly={readonly} />
        </FormFieldInputInnerContainer>

        {VariablePicker && !readonly && (
          <VariablePicker
            instanceId={instanceId}
            multiline
            onVariableSelect={handleVariableTagInsert}
          />
        )}
      </FormFieldInputRowContainer>
      <InputErrorHelper>{error}</InputErrorHelper>
    </FormFieldInputContainer>
  );
};
