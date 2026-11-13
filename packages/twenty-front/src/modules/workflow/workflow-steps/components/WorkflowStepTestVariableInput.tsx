import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { type FamilyState } from '@/ui/utilities/state/jotai/types/FamilyState';
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

type StepTestData = { variableValues: { [variablePath: string]: string } };

type WorkflowStepTestVariableInputProps<TTestData extends StepTestData> = {
  step: WorkflowStep;
  testDataFamilyState: FamilyState<TTestData, string>;
  readonly?: boolean;
};

export const WorkflowStepTestVariableInput = <TTestData extends StepTestData>({
  step,
  testDataFamilyState,
  readonly,
}: WorkflowStepTestVariableInputProps<TTestData>) => {
  const { t } = useLingui();
  const { variableValues } = useAtomFamilyStateValue(
    testDataFamilyState,
    step.id,
  );
  const setTestData = useSetAtomFamilyState(testDataFamilyState, step.id);
  const variablePaths = Array.from(getWorkflowVariablesUsedInStep({ step }));

  if (variablePaths.length === 0) {
    return null;
  }

  const setVariableValue = ({
    variablePath,
    value,
  }: {
    variablePath: string;
    value: string | null;
  }) => {
    setTestData((previousTestData) => ({
      ...previousTestData,
      variableValues: {
        ...previousTestData.variableValues,
        [variablePath]: value ?? '',
      },
    }));
  };

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
            onChange={(value) => setVariableValue({ variablePath, value })}
          />
        ))}
      </StyledVariableInputsContainer>
    </FormFieldInputContainer>
  );
};
