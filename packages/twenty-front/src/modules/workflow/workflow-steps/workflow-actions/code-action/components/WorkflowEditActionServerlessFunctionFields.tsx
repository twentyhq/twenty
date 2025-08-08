import { FormNestedFieldInputContainer } from '@/object-record/record-field/form-types/components/FormNestedFieldInputContainer';
import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { FunctionInput } from '@/workflow/workflow-steps/workflow-actions/code-action/types/FunctionInput';
import styled from '@emotion/styled';
import { isObject } from '@sniptt/guards';

const StyledContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  flex-wrap: wrap;

  > * {
    flex: 1;
    min-width: 200px;
  }
`;

type WorkflowEditActionServerlessFunctionFieldsProps = {
  functionInput: FunctionInput;
  path?: string[];
  readonly?: boolean;
  onInputChange?: (value: any, path: string[]) => void | Promise<void>;
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
    <StyledContainer>
      {Object.entries(functionInput).map(([inputKey, inputValue]) => {
        const currentPath = [...path, inputKey];
        const pathKey = currentPath.join('.');

        if (inputValue !== null && isObject(inputValue)) {
          return (
            <div key={pathKey}>
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
            </div>
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
    </StyledContainer>
  );
};
