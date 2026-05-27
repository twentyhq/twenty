import { FormBooleanFieldInput } from '@/object-record/record-field/ui/form-types/components/FormBooleanFieldInput';
import { FormNestedFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormNestedFieldInputContainer';
import { FormNumberFieldInput } from '@/object-record/record-field/ui/form-types/components/FormNumberFieldInput';
import { FormSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormSelectFieldInput';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { getInputSchemaPropertyAtPath } from '@/workflow/workflow-steps/workflow-actions/code-action/utils/getInputSchemaPropertyAtPath';
import { getWorkflowCodeFieldsEnumSelectOptions } from '@/workflow/workflow-steps/workflow-actions/code-action/utils/getWorkflowCodeFieldsEnumSelectOptions';
import { getWorkflowCodeFieldsLeafKind } from '@/workflow/workflow-steps/workflow-actions/code-action/utils/getWorkflowCodeFieldsLeafKind';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyArray, isNonEmptyString, isObject } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { type FunctionInput, type InputSchema } from 'twenty-shared/workflow';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[3]};

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
  inputSchema?: InputSchema;
};

export const WorkflowEditActionCodeFields = ({
  functionInput,
  path = [],
  readonly,
  onInputChange,
  VariablePicker,
  fullWidth,
  inputSchema,
}: WorkflowEditActionCodeFieldsProps) => {
  return (
    <StyledContainer fullWidth={fullWidth}>
      {Object.entries(functionInput ?? {}).map(([inputKey, inputValue]) => {
        const currentPath = [...path, inputKey];
        const pathKey = currentPath.join('.');

        const schemaProperty = getInputSchemaPropertyAtPath(
          inputSchema,
          currentPath,
        );
        const displayLabel = isNonEmptyString(schemaProperty?.label)
          ? schemaProperty.label
          : inputKey;

        if (inputValue !== null && isObject(inputValue)) {
          return (
            <div key={pathKey}>
              <InputLabel>{displayLabel}</InputLabel>
              <FormNestedFieldInputContainer>
                <WorkflowEditActionCodeFields
                  functionInput={inputValue}
                  path={currentPath}
                  readonly={readonly}
                  onInputChange={onInputChange}
                  VariablePicker={VariablePicker}
                  fullWidth={fullWidth}
                  inputSchema={inputSchema}
                />
              </FormNestedFieldInputContainer>
            </div>
          );
        }

        const leafKind = getWorkflowCodeFieldsLeafKind(schemaProperty);

        if (leafKind === 'boolean') {
          return (
            <FormBooleanFieldInput
              key={pathKey}
              label={displayLabel}
              defaultValue={
                !isDefined(inputValue)
                  ? undefined
                  : typeof inputValue === 'boolean' ||
                      typeof inputValue === 'string'
                    ? inputValue
                    : undefined
              }
              readonly={readonly}
              onChange={(value) => onInputChange?.(value, currentPath)}
              VariablePicker={VariablePicker}
            />
          );
        }

        if (leafKind === 'number') {
          return (
            <FormNumberFieldInput
              key={pathKey}
              label={displayLabel}
              defaultValue={
                !isDefined(inputValue)
                  ? undefined
                  : typeof inputValue === 'number' ||
                      typeof inputValue === 'string'
                    ? inputValue
                    : undefined
              }
              readonly={readonly}
              onChange={(value) => onInputChange?.(value, currentPath)}
              VariablePicker={VariablePicker}
            />
          );
        }

        if (leafKind === 'enum' && isDefined(schemaProperty)) {
          const enumOptions =
            getWorkflowCodeFieldsEnumSelectOptions(schemaProperty);

          if (isNonEmptyArray(enumOptions)) {
            return (
              <FormSelectFieldInput
                key={pathKey}
                label={displayLabel}
                defaultValue={
                  !isDefined(inputValue)
                    ? undefined
                    : typeof inputValue === 'string'
                      ? inputValue
                      : String(inputValue)
                }
                readonly={readonly}
                onChange={(value) => onInputChange?.(value, currentPath)}
                VariablePicker={VariablePicker}
                options={enumOptions}
              />
            );
          }
        }

        return (
          <FormTextFieldInput
            key={pathKey}
            label={displayLabel}
            placeholder={t`Enter value`}
            defaultValue={inputValue ? `${inputValue}` : ''}
            readonly={readonly}
            onChange={(value) => onInputChange?.(value, currentPath)}
            VariablePicker={VariablePicker}
            multiline={schemaProperty?.multiline === true}
          />
        );
      })}
    </StyledContainer>
  );
};
