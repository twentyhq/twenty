import { FunctionInput } from '@/workflow/types/FunctionInput';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { isObject } from '@sniptt/guards';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import styled from '@emotion/styled';
import { ReactNode } from 'react';

const StyledContainer = styled.div`
  display: inline-flex;
  flex-direction: column;
`;

const StyledInputContainer = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  position: relative;
`;

export const WorkflowEditActionFormServerlessFunctionFields = ({
  functionInput,
  path = [],
  VariablePicker,
  onInputChange,
  readonly = false,
}: {
  functionInput: FunctionInput;
  path?: string[];
  VariablePicker?: VariablePickerComponent;
  onInputChange: (value: any, path: string[]) => void;
  readonly?: boolean;
}) => {
  const renderFields = ({
    functionInput,
    path = [],
    VariablePicker,
    onInputChange,
    readonly = false,
  }: {
    functionInput: FunctionInput;
    path?: string[];
    VariablePicker?: VariablePickerComponent;
    onInputChange: (value: any, path: string[]) => void;
    readonly?: boolean;
  }): ReactNode[] => {
    return Object.entries(functionInput).map(([inputKey, inputValue]) => {
      const currentPath = [...path, inputKey];
      const pathKey = currentPath.join('.');
      if (inputValue !== null && isObject(inputValue)) {
        return (
          <StyledContainer key={pathKey}>
            <InputLabel>{inputKey}</InputLabel>
            <StyledInputContainer>
              {renderFields({
                functionInput: inputValue,
                path: currentPath,
                VariablePicker,
                onInputChange,
              })}
            </StyledInputContainer>
          </StyledContainer>
        );
      } else {
        return (
          <FormTextFieldInput
            key={pathKey}
            label={inputKey}
            placeholder="Enter value"
            defaultValue={inputValue ? `${inputValue}` : ''}
            readonly={readonly}
            onPersist={(value) => onInputChange(value, currentPath)}
            VariablePicker={VariablePicker}
          />
        );
      }
    });
  };

  return (
    <>
      {renderFields({
        functionInput,
        path,
        VariablePicker,
        onInputChange,
        readonly,
      })}
    </>
  );
};
