import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { type WorkflowStep } from '@/workflow/types/Workflow';
import { getWorkflowVariablesUsedInStep } from '@/workflow/workflow-steps/utils/getWorkflowVariablesUsedInStep';
import { type HttpRequestFormData } from '@/workflow/workflow-steps/workflow-actions/http-request-action/constants/HttpRequest';
import { useFamilyRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilyRecoilValueV2';
import { useSetFamilyRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetFamilyRecoilStateV2';
import { httpRequestTestDataFamilyState } from '@/workflow/workflow-steps/workflow-actions/http-request-action/states/httpRequestTestDataFamilyState';
import { t } from '@lingui/core/macro';
import styled from '@emotion/styled';

const StyledVariableInputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

type HttpRequestTestVariableInputProps = {
  httpRequestFormData: HttpRequestFormData;
  actionId: string;
  readonly?: boolean;
};

export const HttpRequestTestVariableInput = ({
  httpRequestFormData,
  actionId,
  readonly,
}: HttpRequestTestVariableInputProps) => {
  const httpRequestTestData = useFamilyRecoilValueV2(
    httpRequestTestDataFamilyState,
    actionId,
  );
  const setHttpRequestTestData = useSetFamilyRecoilStateV2(
    httpRequestTestDataFamilyState,
    actionId,
  );
  const mockStep: WorkflowStep = {
    id: 'test-step',
    name: 'Test Step',
    type: 'HTTP_REQUEST',
    valid: true,
    settings: {
      input: httpRequestFormData,
      outputSchema: {},
      errorHandlingOptions: {
        retryOnFailure: { value: false },
        continueOnFailure: { value: false },
      },
    },
  };

  const variablesUsed = getWorkflowVariablesUsedInStep({ step: mockStep });
  const variableArray = Array.from(variablesUsed);

  const handleVariableChange = (variablePath: string, value: string) => {
    setHttpRequestTestData((prev) => ({
      ...prev,
      variableValues: {
        ...prev.variableValues,
        [variablePath]: value,
      },
    }));
  };

  if (variableArray.length === 0) {
    return null;
  }

  return (
    <FormFieldInputContainer>
      <StyledVariableInputsContainer>
        {variableArray.map((variablePath) => (
          <FormTextFieldInput
            key={variablePath}
            label={`${variablePath}`}
            placeholder={t`Enter test value`}
            readonly={readonly}
            defaultValue={
              httpRequestTestData.variableValues[variablePath] || ''
            }
            onChange={(value) =>
              handleVariableChange(variablePath, value || '')
            }
          />
        ))}
      </StyledVariableInputsContainer>
    </FormFieldInputContainer>
  );
};
