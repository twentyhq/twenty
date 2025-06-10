import { FormNestedFieldInputContainer } from '@/object-record/record-field/form-types/components/FormNestedFieldInputContainer';
import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { FunctionInput } from '@/workflow/workflow-steps/workflow-actions/code-action/types/FunctionInput';
import styled from '@emotion/styled';
import { isObject } from '@sniptt/guards';

const StyledContainer = styled.div`
  display: inline-flex;
  flex-direction: column;
`;

type WorkflowEditActionServerlessFunctionFieldsProps = {
  functionInput: FunctionInput;
  path?: string[];
  readonly?: boolean;
  onInputChange?: (value: any, path: string[]) => void;
  VariablePicker?: VariablePickerComponent;
};

export const WorkflowEditActionServerlessFunctionFields = ({
  functionInput,
  path = [],
  readonly,
  onInputChange,
  VariablePicker,
}: WorkflowEditActionServerlessFunctionFieldsProps) => {
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
                <WorkflowEditActionServerlessFunctionFields
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
            onChange={(value) => onInputChange?.(value, currentPath)}
            VariablePicker={VariablePicker}
          />
        );
      })}
    </>
  );
};
