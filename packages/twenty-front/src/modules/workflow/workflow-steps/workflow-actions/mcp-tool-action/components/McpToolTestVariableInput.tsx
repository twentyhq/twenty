import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { type WorkflowMcpToolAction } from '@/workflow/types/Workflow';
import { getWorkflowVariablesUsedInStep } from '@/workflow/workflow-steps/utils/getWorkflowVariablesUsedInStep';
import { mcpToolTestDataFamilyState } from '@/workflow/workflow-steps/workflow-actions/mcp-tool-action/states/mcpToolTestDataFamilyState';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledVariableInputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

type McpToolTestVariableInputProps = {
  action: WorkflowMcpToolAction;
};

export const McpToolTestVariableInput = ({
  action,
}: McpToolTestVariableInputProps) => {
  const { t } = useLingui();
  const mcpToolTestData = useAtomFamilyStateValue(
    mcpToolTestDataFamilyState,
    action.id,
  );
  const setMcpToolTestData = useSetAtomFamilyState(
    mcpToolTestDataFamilyState,
    action.id,
  );

  const variablePaths = Array.from(
    getWorkflowVariablesUsedInStep({ step: action }),
  );

  const handleVariableChange = (variablePath: string, value: string) => {
    setMcpToolTestData((previousTestData) => ({
      ...previousTestData,
      variableValues: {
        ...previousTestData.variableValues,
        [variablePath]: value,
      },
    }));
  };

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
            defaultValue={mcpToolTestData.variableValues[variablePath] ?? ''}
            onChange={(value) =>
              handleVariableChange(variablePath, value ?? '')
            }
          />
        ))}
      </StyledVariableInputsContainer>
    </FormFieldInputContainer>
  );
};
