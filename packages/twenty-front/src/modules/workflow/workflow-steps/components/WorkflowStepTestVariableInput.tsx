import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { type WorkflowStep } from '@/workflow/types/Workflow';
import { getWorkflowVariablesUsedInStep } from '@/workflow/workflow-steps/utils/getWorkflowVariablesUsedInStep';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledVariableInputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

type WorkflowStepTestVariableInputProps = {
  step: WorkflowStep;
  variableValues: { [variablePath: string]: string };
  onVariableChange: (change: { variablePath: string; value: string }) => void;
  readonly?: boolean;
};

export const WorkflowStepTestVariableInput = ({
  step,
  variableValues,
  onVariableChange,
  readonly,
}: WorkflowStepTestVariableInputProps) => {
  const { t } = useLingui();
  const variablePaths = Array.from(getWorkflowVariablesUsedInStep({ step }));

  if (variablePaths.length === 0) {
    return null;
  }

  return (
    <FormFieldInputContainer>
      <StyledVariableInputsContainer>
        {variablePaths.map((variablePath) => (
          <FormTextFieldInput
            key={variablePath}
            label={variablePath}
            placeholder={t`Enter test value`}
            readonly={readonly}
            defaultValue={variableValues[variablePath] ?? ''}
            onChange={(value) =>
              onVariableChange({ variablePath, value: value ?? '' })
            }
          />
        ))}
      </StyledVariableInputsContainer>
    </FormFieldInputContainer>
  );
};
