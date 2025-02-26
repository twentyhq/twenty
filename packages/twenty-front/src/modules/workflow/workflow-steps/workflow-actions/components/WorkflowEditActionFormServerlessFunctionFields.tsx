import { FormNestedFieldInputContainer } from '@/object-record/record-field/form-types/components/FormNestedFieldInputContainer';
import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { FunctionInput } from '@/workflow/workflow-steps/workflow-actions/types/FunctionInput';
import styled from '@emotion/styled';
import { isObject } from '@sniptt/guards';

const StyledContainer = styled.div`
  display: inline-flex;
  flex-direction: column;
`;

type WorkflowEditActionFormServerlessFunctionFieldsProps = {
  functionInput: FunctionInput;
  path?: string[];
  readonly?: boolean;
  onInputChange?: (value: any, path: string[]) => void;
  VariablePicker?: VariablePickerComponent;
};

export const WorkflowEditActionFormServerlessFunctionFields = ({
  functionInput,
  path = [],
  readonly,
  onInputChange,
  VariablePicker,
}: WorkflowEditActionFormServerlessFunctionFieldsProps) => {
  return (
    <>
      {Object.entries(functionInput).map(([inputKey, inputValue]) => {
        const currentPath = [...path, inputKey];
        const pathKey = currentPath.join('.');

        if (inputValue !== null && isObject(inputValue)) {
          return (
            <StyledContainer key={pathKey}>
              <InputLabel>{inputKey}</InputLabel>
              <FormNestedFieldInputContainer>
                <WorkflowEditActionFormServerlessFunctionFields
                  functionInput={inputValue}
                  path={currentPath}
                  readonly={readonly}
                  onInputChange={onInputChange}
                  VariablePicker={VariablePicker}
                />
              </FormNestedFieldInputContainer>
            </StyledContainer>
          );
        }

        return (
          <FormTextFieldInput
            key={pathKey}
            label={inputKey}
            placeholder="Enter value"
            defaultValue={inputValue ? `${inputValue}` : ''}
            readonly={readonly}
            onPersist={(value) => onInputChange?.(value, currentPath)}
            VariablePicker={VariablePicker}
          />
        );
      })}
    </>
  );
};
