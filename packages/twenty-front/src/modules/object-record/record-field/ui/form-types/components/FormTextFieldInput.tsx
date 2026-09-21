import { t } from '@lingui/core/macro';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { TextVariableEditor } from '@/object-record/record-field/ui/form-types/components/TextVariableEditor';
import { useTextVariableEditor } from '@/object-record/record-field/ui/form-types/hooks/useTextVariableEditor';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { Field } from 'twenty-ui/primitives/input';
import { parseEditorContent } from '@/workflow/workflow-variables/utils/parseEditorContent';
import { type ReactNode, useId } from 'react';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { isDefined } from 'twenty-shared/utils';

const StyledInputWithAction = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledInputRow = styled(FormFieldInputRowContainer)`
  flex: 1;
  min-width: 0;
`;

type FormTextFieldInputProps = {
  label?: string;
  error?: string;
  hint?: string;
  action?: ReactNode;
  defaultValue: string | undefined | null;
  onChange: (value: string) => void;
  onBlur?: () => void;
  multiline?: boolean;
  readonly?: boolean;
  placeholder?: string;
  VariablePicker?: VariablePickerComponent;
};

export const FormTextFieldInput = ({
  label,
  error,
  hint,
  action,
  defaultValue,
  placeholder,
  onChange,
  onBlur,
  multiline,
  readonly,
  VariablePicker,
}: FormTextFieldInputProps) => {
  const instanceId = useId();

  const editor = useTextVariableEditor({
    placeholder: placeholder ?? t`Enter text`,
    multiline,
    readonly,
    defaultValue,
    onUpdate: (editor) => {
      const jsonContent = editor.getJSON();
      const parsedContent = parseEditorContent(jsonContent);

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
      {label ? <Field.Label>{label}</Field.Label> : null}

      <StyledInputWithAction>
        <StyledInputRow multiline={multiline}>
          <FormFieldInputInnerContainer
            formFieldInputInstanceId={instanceId}
            hasRightElement={isDefined(VariablePicker) && !readonly}
            multiline={multiline}
            onBlur={onBlur}
          >
            <TextVariableEditor
              placeholder={placeholder ?? t`Enter text`}
              editor={editor}
              multiline={multiline}
              readonly={readonly}
            />
          </FormFieldInputInnerContainer>

          {VariablePicker && !readonly ? (
            <VariablePicker
              instanceId={instanceId}
              multiline={multiline}
              onVariableSelect={handleVariableTagInsert}
            />
          ) : null}
        </StyledInputRow>
        {action}
      </StyledInputWithAction>
      {hint && <Field.Description>{hint}</Field.Description>}
      {error && <Field.Error match>{error}</Field.Error>}
    </FormFieldInputContainer>
  );
};
