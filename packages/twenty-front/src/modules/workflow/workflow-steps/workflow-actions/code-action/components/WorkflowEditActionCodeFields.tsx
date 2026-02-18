import { FormNestedFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormNestedFieldInputContainer';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { type FunctionInput } from 'twenty-shared/workflow';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { isObject } from '@sniptt/guards';

const StyledContainer = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  flex-wrap: wrap;

  > * {
    flex: 1;
    min-width: ${({ fullWidth }) => (fullWidth ? '100%' : '200px')};
  }
`;

type WorkflowEditActionCodeFieldsProps = {
  functionInput: FunctionInput;
  path?: string[];
  readonly?: boolean;
  onInputChange?: (value: any, path: string[]) => void | Promise<void>;
  VariablePicker?: VariablePickerComponent;
  fullWidth?: boolean;
};

export const WorkflowEditActionCodeFields = ({
  functionInput,
  path = [],
  readonly,
  onInputChange,
  VariablePicker,
  fullWidth,
}: WorkflowEditActionCodeFieldsProps) => {
  return (
    <StyledContainer fullWidth={fullWidth}>
      {Object.entries(functionInput).map(([inputKey, inputValue]) => {
        const currentPath = [...path, inputKey];
        const pathKey = currentPath.join('.');

        if (inputValue !== null && isObject(inputValue)) {
          return (
            <div key={pathKey}>
              <InputLabel>{inputKey}</InputLabel>
              <FormNestedFieldInputContainer>
                <WorkflowEditActionCodeFields
                  functionInput={inputValue}
                  path={currentPath}
                  readonly={readonly}
                  onInputChange={onInputChange}
                  VariablePicker={VariablePicker}
                  fullWidth={fullWidth}
                />
              </FormNestedFieldInputContainer>
            </div>
          );
        }

        return (
          <FormTextFieldInput
            key={pathKey}
            label={inputKey}
            placeholder={t`Enter value`}
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
