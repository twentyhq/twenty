import { FormNestedFieldInputContainer } from '@/object-record/record-field/form-types/components/FormNestedFieldInputContainer';
import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { FunctionInput } from '@/workflow/workflow-steps/workflow-actions/types/FunctionInput';
import styled from '@emotion/styled';
import { isObject } from '@sniptt/guards';
import path from 'path';

const StyledContainer = styled.div`
  display: inline-flex;
  flex-direction: column;
`;

type WorkflowEditActionFormServerlessFunctionFieldsProps = {
  functionInput: FunctionInput;
  path?: string[];
} & (
  | {
      VariablePicker: VariablePickerComponent;
      onInputChange: (value: any, path: string[]) => void;
      readonly: false;
    }
  | {
      VariablePicker?: never;
      onInputChange?: never;
      readonly: true;
    }
);

export const WorkflowEditActionFormServerlessFunctionFields = (
  props: WorkflowEditActionFormServerlessFunctionFieldsProps,
) => {
  return (
    <>
      {Object.entries(props.functionInput).map(([inputKey, inputValue]) => {
        const currentPath = [...props.path, inputKey];
        const pathKey = currentPath.join('.');
        if (inputValue !== null && isObject(inputValue)) {
          return (
            <StyledContainer key={pathKey}>
              <InputLabel>{inputKey}</InputLabel>
              <FormNestedFieldInputContainer>
                {renderFields({
                  functionInput: inputValue,
                  path: currentPath,
                  VariablePicker,
                  onInputChange,
                })}
              </FormNestedFieldInputContainer>
            </StyledContainer>
          );
        } else {
          return (
            <FormTextFieldInput
              key={pathKey}
              label={inputKey}
              placeholder="Enter value"
              defaultValue={inputValue ? `${inputValue}` : ''}
              readonly={props.readonly}
              onPersist={(value) => onInputChange(value, currentPath)}
              VariablePicker={VariablePicker}
            />
          );
        }
      })}
    </>
  );
};
