import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { useEmailEditor } from '@/object-record/record-field/ui/form-types/hooks/useEmailEditor';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { InputErrorHelper } from '@/ui/input/components/InputErrorHelper';
import { InputHint } from '@/ui/input/components/InputHint';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { WorkflowEmailEditor } from '@/workflow/workflow-steps/workflow-actions/components/WorkflowEmailEditor';
import styled from '@emotion/styled';
import { useId } from 'react';
import { isDefined } from 'twenty-shared/utils';

const StyledFormFieldInputContainer = styled(FormFieldInputContainer)`
  flex-grow: 1;
`;

const StyledEmailFormFieldContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  flex-grow: 1;
`;

const StyledFormFieldInputInnerContainer = styled(FormFieldInputInnerContainer)`
  flex-direction: column;
  flex-grow: 1;
`;

type FormEmailFieldInputProps = {
  label?: string;
  error?: string;
  hint?: string;
  defaultValue: string | undefined | null;
  onChange: (value: string) => void;
  onBlur?: () => void;
  readonly?: boolean;
  placeholder?: string;
  VariablePicker?: VariablePickerComponent;
};

export const FormEmailFieldInput = ({
  label,
  error,
  hint,
  defaultValue,
  placeholder,
  onChange,
  onBlur,
  readonly,
  VariablePicker,
}: FormEmailFieldInputProps) => {
  const instanceId = useId();

  const editor = useEmailEditor({
    placeholder: placeholder ?? 'Enter email',
    readonly,
    defaultValue,
    onUpdate: (editor) => {
      const jsonContent = editor.getJSON();
      onChange(JSON.stringify(jsonContent));
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
    <StyledFormFieldInputContainer>
      {label ? <InputLabel>{label}</InputLabel> : null}

      <StyledEmailFormFieldContainer>
        <StyledFormFieldInputInnerContainer
          formFieldInputInstanceId={instanceId}
          hasRightElement={isDefined(VariablePicker) && !readonly}
          multiline={true}
          onBlur={onBlur}
        >
          <WorkflowEmailEditor editor={editor} readonly={readonly} />
        </StyledFormFieldInputInnerContainer>

        {VariablePicker && !readonly ? (
          <VariablePicker
            instanceId={instanceId}
            multiline={true}
            onVariableSelect={handleVariableTagInsert}
          />
        ) : null}
      </StyledEmailFormFieldContainer>
      {hint && <InputHint>{hint}</InputHint>}
      {error && <InputErrorHelper>{error}</InputErrorHelper>}
    </StyledFormFieldInputContainer>
  );
};
